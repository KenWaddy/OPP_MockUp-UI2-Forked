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
  Pagination,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../styles/common.js';
import { BillingService, TenantService } from '../services/index.js';
import { DeviceContractItem } from '../mocks/types.js';
import { exportToCsv } from '../utils/exportUtils.js';

// Create service instances
const billingService = new BillingService();
const tenantService = new TenantService();

export const BillingPage: React.FC = () => {
  type BillingDetailItem = {
    billingId?: string;
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
    deviceType: string;
  }>({
    searchText: "",
    nextBillingFrom: getCurrentMonth(), // Default to current month
    paymentType: "",
    deviceType: "",
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
      if (filters.deviceType) serviceFilters.deviceType = filters.deviceType;

      // Convert sort config to the format expected by the service
      const serviceSort = sortConfig ? {
        field: sortConfig.key,
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

    const total = deviceContract.reduce((sum, item) => sum + item.quantity, 0);
    const summary = deviceContract.map(item => `${item.type} (${item.quantity})`).join(', ');
    return `${total} Devices: ${summary}`;
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

  const calculateNextBillingMonth = (billing: AggregatedBillingItem) => {
    if (!billing) return '—';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    if (billing.endDate) {
      try {
        const endDate = new Date(billing.endDate);
        const currentDate = new Date();

        if (currentDate > endDate) {
          return 'Ended';
        }
      } catch (e) {
      }
    }

    if (billing.paymentType === 'Monthly') {
      let nextBillingYear = currentYear;
      let nextBillingMonth = currentMonth;

      return `${nextBillingYear}-${String(nextBillingMonth + 1).padStart(2, '0')}`;
    }
    else if (billing.paymentType === 'Annually') {
      if (!billing.endDate) return '—';

      try {
        const endDate = new Date(billing.endDate);
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth(); // 0-11

        return `${endYear}-${String(endMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—';
      }
    }
    else if (billing.paymentType === 'One-time') {
      if (!billing.startDate) return '—';

      try {
        const startDate = new Date(billing.startDate);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth(); // 0-11

        return `${startYear}-${String(startMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—';
      }
    }

    return '—'; // Default for unknown payment types
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
      <h2>Billing Management</h2>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleExportAllBillings}
        >
          Export All Billing List
        </Button>
      </Box>

      {/* Filters Section */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filters
        </Typography>

        <Grid container spacing={2}>
          {/* Text-based Filter */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Text Search"
              placeholder="Search in Tenant and Billing ID"
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              InputProps={{
                startAdornment: (
                  <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
            />
          </Grid>

          {/* Next Billing Month: From */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Next Billing Month: From"
              value={filters.nextBillingFrom}
              onChange={(e) => setFilters({ ...filters, nextBillingFrom: e.target.value })}
              placeholder="YYYY-MM"
            />
          </Grid>

          {/* Payment Type */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={filters.paymentType}
                label="Payment Type"
                onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {paymentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Device Type */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Device Type</InputLabel>
              <Select
                value={filters.deviceType}
                label="Device Type"
                onChange={(e) => setFilters({ ...filters, deviceType: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {deviceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setFilters({
              searchText: "",
              nextBillingFrom: "", // Clear the filter on reset
              paymentType: "",
              deviceType: "",
            })}
            startIcon={<FilterListIcon />}
          >
            Reset Filters
          </Button>
        </Box>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}
      {/* Pagination - Moved above the table */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="rows-per-page-label">Rows</InputLabel>
          <Select
            labelId="rows-per-page-label"
            value={pagination.limit}
            label="Rows"
            onChange={(e) => {
              setPagination({ ...pagination, page: 1, limit: Number(e.target.value) });
            }}
          >
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={200}>200</MenuItem>
            <MenuItem value={1000}>1000</MenuItem>
          </Select>
        </FormControl>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {allBillings.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
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
                      onClick={() => requestSort('paymentSettings')}
                    >
                      Payment Type {getSortDirectionIndicator('paymentSettings')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('nextBillingMonth')}
                    >
                      Next Billing Month {getSortDirectionIndicator('nextBillingMonth')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('contractStart')}
                    >
                      Contract Start {getSortDirectionIndicator('contractStart')}
                    </TableCell>
                    <TableCell
                      sx={tableHeaderCellStyle}
                      onClick={() => requestSort('contractEnd')}
                    >
                      Contract End {getSortDirectionIndicator('contractEnd')}
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
                    <TableRow key={`${billing.tenantId}-${billing.billingId}`}>
                      <TableCell sx={tableBodyCellStyle}>
                        <span
                          className="clickable"
                          onClick={() => {
                            localStorage.setItem('selectedTenantId', billing.tenantId);
                            window.history.pushState({}, '', '/');
                            const tenantPageEvent = new CustomEvent('navigate-to-tenant', {
                              detail: { tenantId: billing.tenantId }
                            });
                            window.dispatchEvent(tenantPageEvent);
                          }}
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          {billing.tenantName}
                        </span>
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{billing.billingId || 'N/A'}</TableCell>
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
