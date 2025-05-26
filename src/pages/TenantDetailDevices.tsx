import React, { useMemo } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common';

type DeviceType = {
  id: string;
  name: string;
  type: string;
  status: string;
  [key: string]: string;
};

interface TenantDetailDevicesProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
}

export const TenantDetailDevices: React.FC<TenantDetailDevicesProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator
}) => {
  const mockDevices = useMemo<DeviceType[]>(() => [
    { id: 'd1', name: 'Device 1', type: 'Sensor', status: 'Active' },
    { id: 'd2', name: 'Device 2', type: 'Controller', status: 'Inactive' },
    { id: 'd3', name: 'Device 3', type: 'Monitor', status: 'Active' },
  ], []);

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
  }, [mockDevices, sortConfig]);

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
  );
};
