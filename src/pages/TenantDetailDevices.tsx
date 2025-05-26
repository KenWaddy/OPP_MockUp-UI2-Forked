import React, { useState, useEffect } from "react";
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common';
import { DeviceService } from '../services/index';
import { Device } from '../mocks/data/types';

const deviceService = new DeviceService();

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
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 500, // Default to 500 rows as requested
    total: 0,
    totalPages: 0
  });

  const loadDevices = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const serviceSort = sortConfig ? {
        field: sortConfig.key,
        order: sortConfig.direction === 'ascending' ? 'asc' : 'desc' as 'asc' | 'desc'
      } : undefined;
      
      const response = await deviceService.getDevicesForTenant(tenantId, {
        page: pagination.page,
        limit: pagination.limit,
        sort: serviceSort
      });
      
      setDevices(response.data);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });
    } catch (err) {
      setError(`Error loading devices: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [tenantId, pagination.page, pagination.limit, sortConfig]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ ...pagination, page });
  };

  return (
    <Box mt={2}>
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}
      
      {/* Pagination controls above the table */}
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
            sx={{ backgroundColor: "white" }}
          >
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
            <MenuItem value={2000}>2000</MenuItem>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('id')}
                  style={{ cursor: 'pointer' }}
                >
                  Device ID {getSortDirectionIndicator('id')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('serialNo')}
                  style={{ cursor: 'pointer' }}
                >
                  Serial No {getSortDirectionIndicator('serialNo')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{device.status}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{device.id}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{device.serialNo}</TableCell>
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
