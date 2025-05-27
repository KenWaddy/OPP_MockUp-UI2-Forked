import React, { useState, useEffect, useMemo } from "react";
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
  Alert,
  Button,
  IconButton,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../commons/styles.js';
import { DeviceService } from '../mockAPI/index.js';
import { DeviceAssignmentDialog } from '../components/dialogs/DeviceAssignmentDialog';
import { DeviceType2 as Device, TenantType as Tenant, UnregisteredDeviceType as UnregisteredDevice } from '../commons/models.js';

const deviceService = new DeviceService();

interface TenantDetailDevicesProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
  tenantDevices: Device[];
  setTenantDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  selectedTenant: Tenant | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TenantDetailDevices: React.FC<TenantDetailDevicesProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator,
  tenantDevices,
  setTenantDevices,
  selectedTenant,
  loading,
  setLoading,
  error,
  setError
}) => {
  const [devicePagination, setDevicePagination] = useState({
    page: 1,
    limit: 500, // Default to 500 rows as requested
    total: 0,
    totalPages: 0
  });
  
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [openDeviceAssignDialog, setOpenDeviceAssignDialog] = useState(false);
  const [unassignedDevices, setUnassignedDevices] = useState<UnregisteredDevice[]>([]);
  const [selectedUnassignedDevices, setSelectedUnassignedDevices] = useState<string[]>([]);

  const handleDevicePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setDevicePagination({ ...devicePagination, page });
  };

  const handleOpenDeviceAssignDialog = async () => {
    if (!selectedTenant) return;

    try {
      setLoading(true);

      const response = await deviceService.getDevices({
        page: 1,
        limit: 1000,
        filters: {
          isUnregistered: true,
          status: "Registered" // Only show Registered devices
        }
      });

      setUnassignedDevices(response.data as UnregisteredDevice[]);
      setSelectedUnassignedDevices([]);
      setOpenDeviceAssignDialog(true);
    } catch (err) {
      setError(`Error loading unassigned devices: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeviceAssignDialog = () => {
    setOpenDeviceAssignDialog(false);
  };

  const handleAssignDevices = async () => {
    if (!selectedTenant || selectedUnassignedDevices.length === 0) return;

    try {
      setLoading(true);

      const devicesToAssign = unassignedDevices.filter(device =>
        selectedUnassignedDevices.includes(device.id)
      );

      const updatedDevices = [
        ...tenantDevices,
        ...devicesToAssign.map(({ isUnregistered, ...deviceData }) => ({
          ...deviceData,
          status: "Assigned" as const // Set status to Assigned when device is assigned to a tenant
        })) as Device[]
      ];

      setTenantDevices(updatedDevices);

      setOpenDeviceAssignDialog(false);

    } catch (err) {
      setError(`Error assigning devices: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignDevice = async (deviceId: string) => {
    if (!selectedTenant) return;

    try {
      setLoading(true);

      const updatedDevices = tenantDevices.filter((device: Device) => device.id !== deviceId);

      setTenantDevices(updatedDevices);

    } catch (err) {
      setError(`Error unassigning device: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const sortedDevices = useMemo(() => {
    if (!tenantDevices || !sortConfig) return tenantDevices || [];
    return [...tenantDevices].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [tenantDevices, sortConfig]);
  
  const paginatedDevices = useMemo(() => {
    if (!sortedDevices) return [];
    
    const totalDevices = sortedDevices.length;
    const totalPages = Math.ceil(totalDevices / devicePagination.limit);
    
    if (totalDevices !== devicePagination.total || totalPages !== devicePagination.totalPages) {
      setDevicePagination(prev => ({
        ...prev,
        total: totalDevices,
        totalPages: totalPages
      }));
    }
    
    const startIndex = (devicePagination.page - 1) * devicePagination.limit;
    const endIndex = Math.min(startIndex + devicePagination.limit, totalDevices);
    
    return sortedDevices.slice(startIndex, endIndex);
  }, [sortedDevices, devicePagination.page, devicePagination.limit]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="device-rows-per-page-label">Rows</InputLabel>
            <Select
              labelId="device-rows-per-page-label"
              value={devicePagination.limit}
              label="Rows"
              onChange={(e) => {
                setDevicePagination({ ...devicePagination, page: 1, limit: Number(e.target.value) });
              }}
              sx={{ backgroundColor: "white" }}
            >
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={500}>500</MenuItem>
              <MenuItem value={2000}>2000</MenuItem>
            </Select>
          </FormControl>
          <Pagination 
            count={devicePagination.totalPages} 
            page={devicePagination.page} 
            onChange={handleDevicePageChange} 
            color="primary" 
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenDeviceAssignDialog}
          sx={{ fontWeight: 'bold' }}
        >
          Assign Device
        </Button>
      </Box>
      
      {loadingDevices ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table size="small">
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
                  Serial No. {getSortDirectionIndicator('serialNo')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('description')}
                  style={{ cursor: 'pointer' }}
                >
                  Description {getSortDirectionIndicator('description')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('status')}
                  style={{ cursor: 'pointer' }}
                >
                  Status {getSortDirectionIndicator('status')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Attributes</TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDevices && paginatedDevices.length > 0 ? (
                paginatedDevices.map((device: any) => (
                  <TableRow key={device.id}>
                    <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.id}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.serialNo}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.description}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Chip
                        label={device.status}
                        color={device.status === "Activated" ? "success" :
                              device.status === "Assigned" ? "info" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Tooltip 
                        leaveDelay={0}
                        title={
                        <List dense>
                          {device.attributes.map((attr: { key: string, value: string }, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={`${attr.key}: ${attr.value}`} />
                            </ListItem>
                          ))}
                        </List>
                      }>
                        <span style={{ cursor: 'pointer', color: 'blue' }}>
                          View ({device.attributes.length})
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <IconButton
                        size="small"
                        onClick={() => handleUnassignDevice(device.id)}
                        aria-label="unassign"
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={tableBodyCellStyle}>No devices found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Device Assignment Dialog */}
      <DeviceAssignmentDialog
        open={openDeviceAssignDialog}
        onClose={handleCloseDeviceAssignDialog}
        onSave={handleAssignDevices}
        selectedTenant={selectedTenant}
        unassignedDevices={unassignedDevices}
        selectedUnassignedDevices={selectedUnassignedDevices}
        setSelectedUnassignedDevices={setSelectedUnassignedDevices}
      />
    </>
  );
};
