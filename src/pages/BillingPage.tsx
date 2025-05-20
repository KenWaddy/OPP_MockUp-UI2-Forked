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
  Grid
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { mockTenants } from "./TenantPage";

export const BillingPage: React.FC = () => {
  type BillingDetailItem = {
    billingId?: string;
    deviceContract?: { type: string; quantity: number }[];
    startDate?: string;
    endDate?: string;
    paymentType?: "One-time" | "Monthly" | "Annually";
    billingDate?: string;
    dueDay?: number | "End of Month";
    dueMonth?: number;
    billingStartDate?: string;
  };

  type AggregatedBillingItem = BillingDetailItem & {
    tenantId: string;
    tenantName: string;
  };

  const [allBillings, setAllBillings] = useState<AggregatedBillingItem[]>([]);
  
  const getCurrentMonth = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const [filters, setFilters] = useState<{
    tenant: string;
    billingId: string;
    contractStartFrom: string;
    contractStartTo: string;
    contractEndFrom: string;
    contractEndTo: string;
    nextBillingFrom: string;
    nextBillingTo: string;
    paymentType: string;
    deviceType: string;
  }>({
    tenant: "",
    billingId: "",
    contractStartFrom: "",
    contractStartTo: "",
    contractEndFrom: "",
    contractEndTo: "",
    nextBillingFrom: getCurrentMonth(), // Default to current month
    nextBillingTo: "",
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
  
  useEffect(() => {
    const types = new Set<string>();
    
    allBillings.forEach(billing => {
      if (billing.deviceContract) {
        billing.deviceContract.forEach(contract => {
          types.add(contract.type);
        });
      }
    });
    
    setDeviceTypes(Array.from(types).sort());
  }, [allBillings]);
  
  const paymentTypes: ("One-time" | "Monthly" | "Annually")[] = ["One-time", "Monthly", "Annually"];
  
  useEffect(() => {
    const aggregatedBillings: AggregatedBillingItem[] = [];
    
    mockTenants.forEach(tenant => {
      if (tenant.billingDetails) {
        const billingItems = Array.isArray(tenant.billingDetails) 
          ? tenant.billingDetails 
          : [tenant.billingDetails];
        
        billingItems.forEach(billing => {
          aggregatedBillings.push({
            ...billing,
            tenantId: tenant.id,
            tenantName: tenant.name
          });
        });
      }
    });
    
    setAllBillings(aggregatedBillings);
  }, []);
  
  const getFilteredAndSortedBillings = () => {
    let filteredBillings = [...allBillings];
    
    if (filters.tenant) {
      filteredBillings = filteredBillings.filter(
        billing => billing.tenantName.toLowerCase().includes(filters.tenant.toLowerCase())
      );
    }
    
    if (filters.billingId) {
      filteredBillings = filteredBillings.filter(
        billing => billing.billingId?.toLowerCase().includes(filters.billingId.toLowerCase()) || false
      );
    }
    
    if (filters.contractStartFrom) {
      filteredBillings = filteredBillings.filter(
        billing => billing.startDate && compareYearMonth(billing.startDate, filters.contractStartFrom) >= 0
      );
    }
    
    if (filters.contractStartTo) {
      filteredBillings = filteredBillings.filter(
        billing => billing.startDate && compareYearMonth(billing.startDate, filters.contractStartTo) <= 0
      );
    }
    
    if (filters.contractEndFrom) {
      filteredBillings = filteredBillings.filter(
        billing => billing.endDate && compareYearMonth(billing.endDate, filters.contractEndFrom) >= 0
      );
    }
    
    if (filters.contractEndTo) {
      filteredBillings = filteredBillings.filter(
        billing => billing.endDate && compareYearMonth(billing.endDate, filters.contractEndTo) <= 0
      );
    }
    
    if (filters.nextBillingFrom) {
      filteredBillings = filteredBillings.filter(billing => {
        const nextBillingMonth = calculateNextBillingMonth(billing);
        return nextBillingMonth !== '—' && compareYearMonth(nextBillingMonth, filters.nextBillingFrom) >= 0;
      });
    }
    
    if (filters.nextBillingTo) {
      filteredBillings = filteredBillings.filter(billing => {
        const nextBillingMonth = calculateNextBillingMonth(billing);
        return nextBillingMonth !== '—' && compareYearMonth(nextBillingMonth, filters.nextBillingTo) <= 0;
      });
    }
    
    if (filters.paymentType) {
      filteredBillings = filteredBillings.filter(
        billing => billing.paymentType === filters.paymentType
      );
    }
    
    if (filters.deviceType) {
      filteredBillings = filteredBillings.filter(billing => 
        billing.deviceContract?.some(contract => contract.type === filters.deviceType) || false
      );
    }
    
    if (sortConfig) {
      filteredBillings.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortConfig.key) {
          case 'tenant':
            valueA = a.tenantName;
            valueB = b.tenantName;
            break;
          case 'billingId':
            valueA = a.billingId || '';
            valueB = b.billingId || '';
            break;
          case 'contractStart':
            valueA = a.startDate || '';
            valueB = b.startDate || '';
            break;
          case 'contractEnd':
            valueA = a.endDate || '';
            valueB = b.endDate || '';
            break;
          case 'billingStartDate':
            valueA = a.billingStartDate || '';
            valueB = b.billingStartDate || '';
            break;
          case 'nextBillingMonth':
            valueA = calculateNextBillingMonth(a);
            valueB = calculateNextBillingMonth(b);
            break;
          case 'paymentSettings':
            valueA = a.paymentType || '';
            valueB = b.paymentType || '';
            break;
          case 'numberOfDevices':
            valueA = a.deviceContract?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            valueB = b.deviceContract?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            break;
          default:
            valueA = '';
            valueB = '';
        }
        
        if (valueA < valueB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredBillings;
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
    
    let settings = `${billing.paymentType || 'N/A'}`;
    
    if (billing.paymentType === 'One-time' && billing.billingDate) {
      settings += ` | Billing Date: ${billing.billingDate}`;
    }
    
    if ((billing.paymentType === 'Monthly' || billing.paymentType === 'Annually') && billing.dueDay) {
      settings += ` | Due Day: ${billing.dueDay}`;
    }
    
    if (billing.paymentType === 'Annually' && billing.dueMonth) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = typeof billing.dueMonth === 'number' && billing.dueMonth >= 1 && billing.dueMonth <= 12 
        ? months[billing.dueMonth - 1] 
        : billing.dueMonth;
      
      settings += ` | Due Month: ${month}`;
    }
    
    return settings;
  };
  
  const calculateNextBillingMonth = (billing: AggregatedBillingItem) => {
    if (!billing) return '—';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    
    if (billing.paymentType === 'Monthly') {
      let nextBillingYear = currentYear;
      let nextBillingMonth = currentMonth;
      
      return `${nextBillingYear}-${String(nextBillingMonth + 1).padStart(2, '0')}`;
    } 
    else if (billing.paymentType === 'Annually') {
      if (!billing.dueMonth) return '—';
      
      const dueMonth = billing.dueMonth - 1; // Convert to 0-11 format
      
      let nextBillingYear = currentYear;
      let nextBillingMonth = dueMonth - 1; // One month before due month
      
      if (dueMonth < currentMonth) {
        nextBillingYear = currentYear + 1;
      }
      
      if (nextBillingMonth < 0) {
        nextBillingMonth = 11; // December
        nextBillingYear -= 1;
      }
      
      return `${nextBillingYear}-${String(nextBillingMonth + 1).padStart(2, '0')}`;
    } 
    else if (billing.paymentType === 'One-time') {
      if (!billing.billingDate) return '—';
      
      try {
        const billingDate = new Date(billing.billingDate);
        let priorMonth = billingDate.getMonth() - 1;
        let priorYear = billingDate.getFullYear();
        
        if (priorMonth < 0) {
          priorMonth = 11; // December
          priorYear -= 1;
        }
        
        return `${priorYear}-${String(priorMonth + 1).padStart(2, '0')}`;
      } catch (e) {
        return '—';
      }
    }
    
    return '—'; // Default for unknown payment types
  };

  const filteredAndSortedBillings = getFilteredAndSortedBillings();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        m: 2,
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Billing Management
        </Typography>
      </Box>
      
      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Filters
        </Typography>
        
        <Grid container spacing={2}>
          {/* First row: Text-based Filters and Dropdown Filters */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Tenant"
              value={filters.tenant}
              onChange={(e) => setFilters({ ...filters, tenant: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Billing ID"
              value={filters.billingId}
              onChange={(e) => setFilters({ ...filters, billingId: e.target.value })}
            />
          </Grid>
          
          {/* Moved Dropdown Filters to first row */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Settings</InputLabel>
              <Select
                value={filters.paymentType}
                label="Payment Settings"
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
          
          {/* Stacked Date-based Range Filters vertically */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contract Start
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="From (YYYY-MM)"
                value={filters.contractStartFrom}
                onChange={(e) => setFilters({ ...filters, contractStartFrom: e.target.value })}
                placeholder="2023-01"
              />
              <TextField
                fullWidth
                size="small"
                label="To (YYYY-MM)"
                value={filters.contractStartTo}
                onChange={(e) => setFilters({ ...filters, contractStartTo: e.target.value })}
                placeholder="2025-12"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contract End
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="From (YYYY-MM)"
                value={filters.contractEndFrom}
                onChange={(e) => setFilters({ ...filters, contractEndFrom: e.target.value })}
                placeholder="2023-01"
              />
              <TextField
                fullWidth
                size="small"
                label="To (YYYY-MM)"
                value={filters.contractEndTo}
                onChange={(e) => setFilters({ ...filters, contractEndTo: e.target.value })}
                placeholder="2025-12"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Next Billing Month
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="From (YYYY-MM)"
                value={filters.nextBillingFrom}
                onChange={(e) => setFilters({ ...filters, nextBillingFrom: e.target.value })}
                placeholder="2023-01"
              />
              <TextField
                fullWidth
                size="small"
                label="To (YYYY-MM)"
                value={filters.nextBillingTo}
                onChange={(e) => setFilters({ ...filters, nextBillingTo: e.target.value })}
                placeholder="2025-12"
              />
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setFilters({
              tenant: "",
              billingId: "",
              contractStartFrom: "",
              contractStartTo: "",
              contractEndFrom: "",
              contractEndTo: "",
              nextBillingFrom: getCurrentMonth(),
              nextBillingTo: "",
              paymentType: "",
              deviceType: "",
            })}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 2 }} />
      
      {filteredAndSortedBillings.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('tenant')}
                >
                  Tenant {getSortDirectionIndicator('tenant')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('billingId')}
                >
                  Billing ID {getSortDirectionIndicator('billingId')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('contractStart')}
                >
                  Contract Start {getSortDirectionIndicator('contractStart')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('contractEnd')}
                >
                  Contract End {getSortDirectionIndicator('contractEnd')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('billingStartDate')}
                >
                  Billing Start Date {getSortDirectionIndicator('billingStartDate')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('nextBillingMonth')}
                >
                  Next Billing Month {getSortDirectionIndicator('nextBillingMonth')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('paymentSettings')}
                >
                  Payment Settings {getSortDirectionIndicator('paymentSettings')}
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333', cursor: 'pointer' }}
                  onClick={() => requestSort('numberOfDevices')}
                >
                  Number of Device {getSortDirectionIndicator('numberOfDevices')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedBillings.map((billing, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333', fontWeight: 'medium' }}>{billing.tenantName}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{billing.billingId || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{billing.startDate || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{billing.endDate || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{billing.billingStartDate || 'N/A'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{calculateNextBillingMonth(billing)}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>{renderPaymentSettings(billing)}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: '#333' }}>
                    {renderNumberOfDevices(billing.deviceContract)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No billing information available.
        </Typography>
      )}
    </Paper>
  );
};
