import React, { useMemo, useEffect, useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common';
import { BillingService } from '../services/billing.service';

const billingService = new BillingService();

type BillingType = {
  id: string;
  paymentType: string;
  startDate?: string;
  endDate?: string;
  deviceContract?: any[];
  description?: string;
  [key: string]: any;
};

interface TenantDetailBillingProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
}

export const TenantDetailBilling: React.FC<TenantDetailBillingProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator
}) => {
  const [billingRecords, setBillingRecords] = useState<BillingType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!tenantId) return;
      
      setLoading(true);
      try {
        const allBillingItems = await billingService.getAllBillingItems();
        const tenantBillingItems = allBillingItems.filter(item => 
          item.subscriptionId === tenantId
        );
        
        setBillingRecords(tenantBillingItems);
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingData();
  }, [tenantId]);

  const sortedBilling = useMemo(() => {
    if (!sortConfig) return billingRecords;
    return [...billingRecords].sort((a, b) => {
      const aValue = a[sortConfig.key] as string | number;
      const bValue = b[sortConfig.key] as string | number;
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [billingRecords, sortConfig]);

  return (
    <Box mt={2}>
      {loading ? (
        <Typography variant="body1">Loading billing details...</Typography>
      ) : sortedBilling.length === 0 ? (
        <Typography variant="body1">No billing details found</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('paymentType')}
                  style={{ cursor: 'pointer' }}
                >
                  Payment Type {getSortDirectionIndicator('paymentType')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('startDate')}
                  style={{ cursor: 'pointer' }}
                >
                  Start Date {getSortDirectionIndicator('startDate')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('endDate')}
                  style={{ cursor: 'pointer' }}
                >
                  End Date {getSortDirectionIndicator('endDate')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('description')}
                  style={{ cursor: 'pointer' }}
                >
                  Description {getSortDirectionIndicator('description')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBilling.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell sx={tableBodyCellStyle}>{billing.paymentType}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.startDate || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.endDate || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.description || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>Edit</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
