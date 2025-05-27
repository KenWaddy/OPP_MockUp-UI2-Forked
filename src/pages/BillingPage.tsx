import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";
import { PaginationComponent } from '../components/tables/pagination';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FilterSection } from '../components/tables/filter_section';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, tableContainerStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../commons/styles.js';
import { BillingService, TenantService } from '../mockAPI/index.js';
import { DeviceContractItem } from '../commons/models.js';
import { exportToCsv } from '../commons/export.js';
import { calculateNextBillingMonth } from '../commons/billing.js';

// Create service instances
const billingService = new BillingService();
const tenantService = new TenantService();

export const BillingPage: React.FC = () => {
  type BillingDetailItem = {
    id?: string;
    deviceContract?: { type: string; quantity: number }[];
    startDate?: string;
    endDate?: string;
    paymentType?: "One-time" | "Monthly" | "Annually";
    billingDate?: string;
    dueMonth?: number;
    description?: string;
  };

  type AggregatedBillingItem = BillingDetailItem & {
    tenantId: string;
    tenantName: string;
  };

  const [allBillings, setAllBillings] = useState<AggregatedBillingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 200, // Default to 200 rows
    total: 0,
    totalPages: 0
  });

  const getCurrentMonth = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const [filters, setFilters] = useState<{
    searchText: string;
    nextBillingFrom: string;
    paymentType: string;
  }>({
    searchText: "",
    nextBillingFrom: getCurrentMonth(), // Default to current month
    paymentType: "",
  });

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const compareYearMonth = (date1: string, date2: string): number => {
    if (!date1 || !date2) return 0;

    const [year1, month1] = date1.split('-').map(Number);
    const [year2, month2] = date2.split('-').map(Number);

    if (year1 !== year2) {
      return year1 - year2;
    }

    return month1 - month2;
  };

  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);

  const loadBillings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert filters to the format expected by the service
      const serviceFilters: Record<string, any> = {};
      if (filters.searchText) {
        serviceFilters.unifiedSearch = filters.searchText;
      }
      if (filters.nextBillingFrom) serviceFilters.nextBillingFrom = filters.nextBillingFrom;
      if (filters.paymentType) serviceFilters.paymentType = filters.paymentType;

      // Convert sort config to the format expected by the service
      const serviceSort = sortConfig ? {
        field: sortConfig.key === 'tenant' ? 'tenantName' : 
               sortConfig.key === 'billingId' ? 'id' : 
               sortConfig.key,
        order: sortConfig.direction === 'ascending' ? 'asc' : 'desc' as 'asc' | 'desc'
      } : undefined;

      const response = await billingService.getBillingItems({
        page: pagination.page,
        limit: pagination.limit,
        filters: serviceFilters,
        sort: serviceSort
      });

      setAllBillings(response.data as unknown as AggregatedBillingItem[]);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });

      // Extract all device types for the filter dropdown
      const types = new Set<string>();
      response.data.forEach(billing => {
        const billingItem = billing as unknown as AggregatedBillingItem;
        if (billingItem.deviceContract) {
          (billingItem.deviceContract as { type: string; quantity: number }[]).forEach(contract => {
            types.add(contract.type);
          });
        }
      });
      setDeviceTypes(Array.from(types).sort());
    } catch (err) {
      setError(`Error loading billing data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Load billings when component mounts, pagination changes, or filters/sort changes
  useEffect(() => {
    loadBillings();
  }, [pagination.page, pagination.limit, filters, sortConfig]);

  const paymentTypes: ("One-time" | "Monthly" | "Annually")[] = ["One-time", "Monthly", "Annually"];

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ ...pagination, page });
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }

    return sortConfig.direction === 'ascending'
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
  };

  const renderNumberOfDevices = (deviceContract: { type: string; quantity: number }[] | undefined) => {
    if (!deviceContract || deviceContract.length === 0) return 'No devices';

    return deviceContract.map(item => `${item.type} (${item.quantity})`).join(', ');
  };

  const renderPaymentSettings = (billing: AggregatedBillingItem) => {
    if (!billing) return 'N/A';

    const paymentType = billing.paymentType || 'N/A';
    let additionalInfo = '';

    if (billing.paymentType === 'One-time' && billing.billingDate) {
      additionalInfo = ` | Billing Date: ${billing.billingDate}`;
    }

    if (billing.paymentType === 'Annually' && billing.dueMonth) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = typeof billing.dueMonth === 'number' && billing.dueMonth >= 1 && billing.dueMonth <= 12
        ? months[billing.dueMonth - 1]
        : billing.dueMonth;

      additionalInfo = ` | Due Month: ${month}`;
    }

    return (
      <>
        <Chip
          label={paymentType}
          size="small"
          color={
            paymentType === "Monthly" ? "info" :
            paymentType === "Annually" ? "success" :
            paymentType === "One-time" ? "warning" :
            "default"
          }
        />
        {additionalInfo && <span style={{ marginLeft: '8px' }}>{additionalInfo}</span>}
      </>
    );
  };



  const handleExportAllBillings = async () => {
    try {
      setLoading(true);
      const allBillingItems = await billingService.getAllBillingItems();

      const headers = [
        'tenantName', 'billingId', 'startDate', 'endDate',
        'nextBillingMonth', 'paymentSettings',
        'numberOfDevices', 'deviceContractDetails', 'description'
      ];

      exportToCsv(allBillingItems, 'billing-list-export.csv', headers);
    } catch (err) {
      setError(`Error exporting billing items: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="billing-list">

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleExportAllBillings}
          sx={{ fontWeight: 'bold' }}
        >
          Export All Billing List
        </Button>
      </Box>

      {/* Filters Section */}
      <FilterSection
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={() => setFilters({
          searchText: "",
          nextBillingFrom: "", // Clear the filter on reset
          paymentType: "",
        })}
        filterFields={[
          {
            type: 'text',
            key: 'searchText',
            label: 'Text Search',
            placeholder: 'Search in Tenant and Billing ID',
            startAdornment: true,
            gridSize: 3
          },
          {
            type: 'date',
            key: 'nextBillingFrom',
            label: 'Next Billing Month: From',
            placeholder: 'YYYY-MM',
            gridSize: 3
          },
          {
            type: 'select',
            key: 'paymentType',
            label: 'Payment Type',
            options: paymentTypes,
            gridSize: 3
          }
        ]}
      />

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}
      {/* Pagination - Moved above the table */}
      <PaginationComponent
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        pageSizeOptions={[50, 200, 1000]}
      />

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {allBillings.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('tenant')}
                    >
                      Tenant {getSortDirectionIndicator('tenant')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('billingId')}
                    >
                      Billing ID {getSortDirectionIndicator('billingId')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('paymentType')}
                    >
                      Payment Type {getSortDirectionIndicator('paymentType')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('nextBillingMonth')}
                    >
                      Next Billing Month {getSortDirectionIndicator('nextBillingMonth')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('startDate')}
                    >
                      Contract Start {getSortDirectionIndicator('startDate')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('endDate')}
                    >
                      Contract End {getSortDirectionIndicator('endDate')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('numberOfDevices')}
                    >
                      Number of Devices {getSortDirectionIndicator('numberOfDevices')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('description')}
                    >
                      Description {getSortDirectionIndicator('description')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allBillings.map((billing) => (
                    <TableRow key={`${billing.tenantId}-${billing.id}`}>
                      <TableCell sx={tableBodyCellStyle}>
                        <span
                          className="clickable"
                          onClick={() => {
                            localStorage.setItem('selectedTenantId', billing.tenantId);
                            window.history.pushState({}, '', '/');
                            const tenantPageEvent = new CustomEvent('navigate-to-tenant', {
                              detail: { tenant: { id: billing.tenantId } }
                            });
                            window.dispatchEvent(tenantPageEvent);
                          }}
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          {billing.tenantName}
                        </span>
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.id || 'N/A'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{renderPaymentSettings(billing)}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{calculateNextBillingMonth(billing)}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.startDate || 'N/A'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.endDate || 'N/A'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{renderNumberOfDevices(billing.deviceContract)}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.description || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
              <Typography>No billing records match the filter criteria</Typography>
            </Paper>
          )}
        </>
      )}
    </div>
  );
};
