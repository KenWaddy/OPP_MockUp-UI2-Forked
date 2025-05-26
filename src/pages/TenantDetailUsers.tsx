import React, { useMemo } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common';

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: string;
};

interface TenantDetailUsersProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
}

export const TenantDetailUsers: React.FC<TenantDetailUsersProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator
}) => {
  const mockUsers = useMemo<UserType[]>(() => [
    { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  ], []);

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return mockUsers;
    return [...mockUsers].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [mockUsers, sortConfig]);

  return (
    <Box mt={2}>
      <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={tableHeaderCellStyle}
                onClick={() => requestSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Name {getSortDirectionIndicator('name')}
              </TableCell>
              <TableCell 
                sx={tableHeaderCellStyle}
                onClick={() => requestSort('email')}
                style={{ cursor: 'pointer' }}
              >
                Email {getSortDirectionIndicator('email')}
              </TableCell>
              <TableCell 
                sx={tableHeaderCellStyle}
                onClick={() => requestSort('role')}
                style={{ cursor: 'pointer' }}
              >
                Role {getSortDirectionIndicator('role')}
              </TableCell>
              <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={tableBodyCellStyle}>{user.name}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{user.email}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{user.role}</TableCell>
                <TableCell sx={tableBodyCellStyle}>Edit</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
