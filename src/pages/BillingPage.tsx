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
  Divider
} from "@mui/material";
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
      <Divider sx={{ mb: 2 }} />
      
      {allBillings.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Billing ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Contract Start</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Contract End</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Billing Start Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Next Billing Month</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Payment Settings</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#333' }}>Number of Device</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allBillings.map((billing, index) => (
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
