import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common.js';

export const TenantDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
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

  type UserType = {
    id: string;
    name: string;
    email: string;
    role: string;
    [key: string]: string;
  };

  const mockUsers: UserType[] = [
    { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  ];

  type DeviceType = {
    id: string;
    name: string;
    type: string;
    status: string;
    [key: string]: string;
  };

  const mockDevices: DeviceType[] = [
    { id: 'd1', name: 'Device 1', type: 'Sensor', status: 'Active' },
    { id: 'd2', name: 'Device 2', type: 'Controller', status: 'Inactive' },
    { id: 'd3', name: 'Device 3', type: 'Monitor', status: 'Active' },
  ];

  type BillingType = {
    id: string;
    paymentType: string;
    amount: number;
    dueDate: string;
    [key: string]: string | number;
  };

  const mockBilling: BillingType[] = [
    { id: 'b1', paymentType: 'Monthly', amount: 100, dueDate: '2024-02-01' },
    { id: 'b2', paymentType: 'Annual', amount: 1000, dueDate: '2024-12-01' },
    { id: 'b3', paymentType: 'One-time', amount: 500, dueDate: '2024-01-15' },
  ];

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
  }, [sortConfig]);

  const sortedDevices = useMemo(() => {
    if (!sortConfig) return mockDevices;
    return [...mockDevices].sort((a, b) => {
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
  }, [sortConfig]);

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
  }, [sortConfig]);

  return (
    <Box p={3}>
      <Button onClick={() => navigate(-1)}>Tenant List</Button>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Basic Info" />
        <Tab label="User List" />
        <Tab label="Device List" />
        <Tab label="Billing Info" />
      </Tabs>

      {tab === 0 && <Box mt={2}><Typography>Basic Info Content</Typography></Box>}
      {tab === 1 && (
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
      )}
      {tab === 2 && (
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
                    onClick={() => requestSort('type')}
                    style={{ cursor: 'pointer' }}
                  >
                    Type {getSortDirectionIndicator('type')}
                  </TableCell>
                  <TableCell 
                    sx={tableHeaderCellStyle}
                    onClick={() => requestSort('status')}
                    style={{ cursor: 'pointer' }}
                  >
                    Status {getSortDirectionIndicator('status')}
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.status}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>Edit</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {tab === 3 && (
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
      )}
    </Box>
  );
};
