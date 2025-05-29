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
import { FilterSection } from '../components/tables/filter_section';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, tableContainerStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../commons/styles.js';
import { useSorting } from '../hooks/useSorting';
import { SortableTableCell } from '../components/tables/SortableTableCell';
import { BillingService, TenantService } from '../mockAPI/index.js';
import { DeviceContractItem, BillingWithTenant } from '../commons/models.js';
import { exportToCsv } from '../commons/export_CSV.js';
import { calculateNextBillingDate } from '../commons/billing_calc.js';
import { useTranslation } from "react-i18next";

// Create service instances
const billingService = new BillingService();
const tenantService = new TenantService();

export const BillingPage: React.FC = () => {
  const { t } = useTranslation();

  const [allBillings, setAllBillings] = useState<BillingWithTenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 200, // Default to 200 rows
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<{
    searchText: string;
    nextBillingFrom: string;
    paymentType: string;
  }>({
    searchText: "",
    nextBillingFrom: "", // Default to blank
    paymentType: "",
  });

  const { sortConfig, requestSort } = useSorting();

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

      setAllBillings(response.data as unknown as BillingWithTenant[]);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });

      // Extract all device types for the filter dropdown
      const types = new Set<string>();
      response.data.forEach(billing => {
        const billingItem = billing as unknown as BillingWithTenant;
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


  const renderNumberOfDevices = (deviceContract: { type: string; quantity: number }[] | undefined) => {
    if (!deviceContract || deviceContract.length === 0) return 'No devices';

    return deviceContract.map(item => `${item.type} (${item.quantity})`).join(', ');
  };

  const renderPaymentSettings = (billing: BillingWithTenant) => {
    if (!billing) return 'N/A';

    const paymentType = billing.paymentType || 'N/A';
    
    return (
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
    );
  };



  const handleExportAllBillings = async () => {
    try {
      setLoading(true);
      const allBillingItems = await billingService.getAllBillingItems();

      const headers = [
        'tenantName', 'billingId', 'startDate', 'endDate',
        'nextBillingDate', 'paymentSettings',
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
          {t('billing.exportAllBillingList')}
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
            label: t('billing.textSearch'),
            placeholder: t('billing.textSearch'),
            startAdornment: true,
            gridSize: 3
          },
          {
            type: 'date',
            key: 'nextBillingFrom',
            label: t('billing.nextBillingFrom'),
            placeholder: 'YYYY-MM-DD',
            gridSize: 3
          },
          {
            type: 'select',
            key: 'paymentType',
            label: t('billing.paymentType'),
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
                    <SortableTableCell
                      sortKey="tenant"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('common.tenant')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="billingId"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.billingId')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="billingManageNo"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.billingManageNo')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="paymentType"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.paymentType')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="nextBillingDate"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.nextBillingDate')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="startDate"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.contractStart')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="endDate"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.contractEnd')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="numberOfDevices"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('billing.numberOfDevices')}
                    </SortableTableCell>
                    <SortableTableCell
                      sortKey="description"
                      sortConfig={sortConfig}
                      onRequestSort={requestSort}
                      sx={tableHeaderCellStyle}
                    >
                      {t('common.description')}
                    </SortableTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allBillings.map((billing) => (
                    <TableRow key={`${billing.tenantId}-${billing.id}`}>
                      <TableCell sx={tableBodyCellStyle}>
                        <span
                          className="clickable"
                          onClick={() => {
                            localStorage.setItem('selectedTenantId', billing.subscriptionId);
                            window.history.pushState({}, '', '/');
                            const tenantPageEvent = new CustomEvent('navigate-to-tenant', {
                              detail: { tenant: { id: billing.subscriptionId } }
                            });
                            window.dispatchEvent(tenantPageEvent);
                          }}
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          {billing.tenantName}
                        </span>
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.id || 'N/A'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.billingManageNo || '—'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{renderPaymentSettings(billing)}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{calculateNextBillingDate(billing)}</TableCell>
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
