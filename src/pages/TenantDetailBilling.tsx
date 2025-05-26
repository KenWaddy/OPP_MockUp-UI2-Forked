import React, { useMemo } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common';

type BillingType = {
  id: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  [key: string]: string | number;
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
  const mockBilling = useMemo<BillingType[]>(() => [
    { id: 'b1', paymentType: 'Monthly', amount: 100, dueDate: '2024-02-01' },
    { id: 'b2', paymentType: 'Annual', amount: 1000, dueDate: '2024-12-01' },
    { id: 'b3', paymentType: 'One-time', amount: 500, dueDate: '2024-01-15' },
  ], []);

  const sortedBilling = useMemo(() => {
    if (!sortConfig) return mockBilling;
    return [...mockBilling].sort((a, b) => {
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
  }, [mockBilling, sortConfig]);

  return (
    <Box mt={2}>
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
                onClick={() => requestSort('amount')}
                style={{ cursor: 'pointer' }}
              >
                Amount {getSortDirectionIndicator('amount')}
              </TableCell>
              <TableCell 
                sx={tableHeaderCellStyle}
                onClick={() => requestSort('dueDate')}
                style={{ cursor: 'pointer' }}
              >
                Due Date {getSortDirectionIndicator('dueDate')}
              </TableCell>
              <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBilling.map((billing) => (
              <TableRow key={billing.id}>
                <TableCell sx={tableBodyCellStyle}>{billing.paymentType}</TableCell>
                <TableCell sx={tableBodyCellStyle}>${billing.amount}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{billing.dueDate}</TableCell>
                <TableCell sx={tableBodyCellStyle}>Edit</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
