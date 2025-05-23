import React, { useState, useEffect } from "react";
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  Pagination,
  CircularProgress,
  Alert
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../styles/common.js';
import { Attribute, Device, DeviceWithTenant, UnregisteredDevice, DeviceType, defaultDeviceTypes, getDeviceTypeByName } from '../mocks/index.js';
import { DeviceService, TenantService } from '../services/index.js';
import { exportToCsv } from '../utils/exportUtils.js';

// Create service instances
const deviceService = new DeviceService();
const tenantService = new TenantService();

export const DevicePage: React.FC = () => {
  const [allDevices, setAllDevices] = useState<(DeviceWithTenant | UnregisteredDevice)[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithTenant | UnregisteredDevice | null>(null);
  const [openAttributesDialog, setOpenAttributesDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableAttributes, setEditableAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ key: '', value: '' });
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [editableDevice, setEditableDevice] = useState<DeviceWithTenant | UnregisteredDevice | null>(null);
  const [openDeviceTypeDialog, setOpenDeviceTypeDialog] = useState(false);
  const [editableDeviceTypes, setEditableDeviceTypes] = useState<DeviceType[]>([]);
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>({ name: '', option: '', description: '' });
  const [tenantOptions, setTenantOptions] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 500, // Default to 500 rows
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState<{
    searchText: string;
    type: string;
    status: string;
  }>({
    searchText: "",
    type: "",
    status: "",
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const statusOptions: Device["status"][] = ["Registered", "Assigned", "Activated"];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load tenants for the dropdown
        const tenantsResponse = await tenantService.getTenants({
          page: 1,
          limit: 1000 // Load all tenants for the dropdown
        });
        
        setTenantOptions(tenantsResponse.data.map(tenant => ({
          id: tenant.id,
          name: tenant.name
        })));
        
        // Initial devices load will happen in the loadDevices effect
      } catch (err) {
        setError(`Error loading data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Initialize editable device types with default device types
    setEditableDeviceTypes([...defaultDeviceTypes]);
    
    // Initialize device type names for dropdowns
    setDeviceTypes(defaultDeviceTypes.map(type => type.name));
  }, []);
  
  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert filters to the format expected by the service
      const serviceFilters: Record<string, any> = {};
      if (filters.searchText) serviceFilters.searchText = filters.searchText;
      if (filters.type) serviceFilters.type = filters.type;
      if (filters.status) serviceFilters.status = filters.status;
      
      // Convert sort config to the format expected by the service
      const serviceSort = sortConfig ? {
        field: sortConfig.key,
        order: sortConfig.direction === 'ascending' ? 'asc' : 'desc' as 'asc' | 'desc'
      } : undefined;
      
      const response = await deviceService.getDevices({
        page: pagination.page,
        limit: pagination.limit,
        filters: serviceFilters,
        sort: serviceSort
      });
      
      setAllDevices(response.data);
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
  
  // Load devices when component mounts, pagination changes, or filters/sort changes
  useEffect(() => {
    loadDevices();
  }, [pagination.page, pagination.limit, filters, sortConfig]);
  
  const handleOpenAttributesDialog = (device: DeviceWithTenant | UnregisteredDevice) => {
    setSelectedDevice(device);
    setEditableAttributes(device.attributes.map((attr: Attribute) => ({ ...attr })));
    setEditMode(false);
    setOpenAttributesDialog(true);
  };
  
  const handleCloseAttributesDialog = () => {
    setOpenAttributesDialog(false);
    setEditMode(false);
  };
  
  const handleEditClick = () => {
    setEditMode(true);
  };
  
  const handleSaveClick = async () => {
    if (selectedDevice) {
      try {
        setLoading(true);
        // In a real implementation, this would call a service method to save the device attributes
        // For now, we'll just update the local state
        const updatedDevices = allDevices.map(device => 
          device.id === selectedDevice.id 
            ? { ...device, attributes: editableAttributes } 
            : device
        );
        setAllDevices(updatedDevices);
        setSelectedDevice({ ...selectedDevice, attributes: editableAttributes });
        setEditMode(false);
        
        await loadDevices(); // Reload devices from the service
      } catch (err) {
        setError(`Error saving attributes: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleAddAttribute = () => {
    if (newAttribute.key.trim() !== '') {
      setEditableAttributes([...editableAttributes, { ...newAttribute }]);
      setNewAttribute({ key: '', value: '' });
    }
  };
  
  const handleRemoveAttribute = (index: number) => {
    const newList = [...editableAttributes];
    newList.splice(index, 1);
    setEditableAttributes(newList);
  };
  
  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...editableAttributes];
    newAttributes[index][field] = value;
    setEditableAttributes(newAttributes);
  };
  
  const handleOpenDeviceDialog = (device?: DeviceWithTenant | UnregisteredDevice) => {
    if (device) {
      setSelectedDevice(device);
      setEditableDevice({...device});
    } else {
      setSelectedDevice(null);
      setEditableDevice({
        id: `d-new-${Math.floor(Math.random() * 1000)}`,
        name: '',
        type: "Server",
        deviceId: `DEV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        serialNo: '',
        description: '',
        status: "Registered",
        attributes: [],
        isUnregistered: true
      } as UnregisteredDevice);
    }
    setOpenDeviceDialog(true);
  };
  
  const handleCloseDeviceDialog = () => {
    setOpenDeviceDialog(false);
  };
  
  const handleSaveDevice = async () => {
    if (editableDevice) {
      try {
        setLoading(true);
        // In a real implementation, this would call a service method to save the device
        // For now, we'll just update the local state
        let updatedDevices;
        
        if (selectedDevice) {
          // Update existing device
          updatedDevices = allDevices.map(device => 
            device.id === selectedDevice.id 
              ? editableDevice 
              : device
          );
        } else {
          // Add new device
          updatedDevices = [...allDevices, editableDevice];
        }
        
        setAllDevices(updatedDevices);
        setOpenDeviceDialog(false);
        
        await loadDevices(); // Reload devices from the service
      } catch (err) {
        setError(`Error saving device: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDeleteDevice = async (deviceId: string) => {
    try {
      setLoading(true);
      // In a real implementation, this would call a service method to delete the device
      // For now, we'll just update the local state
      const updatedDevices = allDevices.filter(device => device.id !== deviceId);
      setAllDevices(updatedDevices);
      
      await loadDevices(); // Reload devices from the service
    } catch (err) {
      setError(`Error deleting device: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignToTenant = async (device: UnregisteredDevice, tenantId: string, tenantName: string) => {
    try {
      setLoading(true);
      // In a real implementation, this would call a service method to assign the device to a tenant
      // For now, we'll just update the local state
      const updatedDevices = allDevices.map(d => {
        if (d.id === device.id) {
          const { isUnregistered, ...deviceWithoutFlag } = d as UnregisteredDevice;
          return {
            ...deviceWithoutFlag,
            tenantId,
            tenantName,
            status: "Assigned" // Set status to Assigned when device is assigned to a tenant
          } as DeviceWithTenant;
        }
        return d;
      });
      setAllDevices(updatedDevices);
      
      await loadDevices(); // Reload devices from the service
    } catch (err) {
      setError(`Error assigning device to tenant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ ...pagination, page });
  };
  
  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
  };
  
  const handleExportAllDevices = async () => {
    try {
      setLoading(true);
      const allDevices = await deviceService.getAllDevices();
      
      const devicesForExport = allDevices.map(device => {
        const attributesFormatted = device.attributes.map(attr => 
          `${attr.key}: ${attr.value}`
        ).join('; ');
        
        return {
          ...device,
          attributes: attributesFormatted
        };
      });
      
      const headers = [
        'tenantName', 'name', 'type', 'deviceId', 'serialNo', 
        'description', 'status', 'attributes'
      ];
      
      exportToCsv(devicesForExport, 'device-list-export.csv', headers);
    } catch (err) {
      setError(`Error exporting devices: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDeviceTypeDialog = () => {
    setOpenDeviceTypeDialog(true);
  };
  
  const handleCloseDeviceTypeDialog = () => {
    setOpenDeviceTypeDialog(false);
  };
  
  const handleAddDeviceType = () => {
    if (newDeviceType.name.trim() !== '') {
      const updatedDeviceTypes = [...editableDeviceTypes, { ...newDeviceType }];
      setEditableDeviceTypes(updatedDeviceTypes);
      setNewDeviceType({ name: '', option: '', description: '' });
      
      // Update the deviceTypes array for use in other parts of the component
      setDeviceTypes(updatedDeviceTypes.map(type => type.name));
      
      // In a real implementation, you would update the backend
    }
  };
  
  const handleRemoveDeviceType = (index: number) => {
    const newList = [...editableDeviceTypes];
    newList.splice(index, 1);
    setEditableDeviceTypes(newList);
    
    // Update the deviceTypes array for use in other parts of the component
    setDeviceTypes(newList.map(type => type.name));
    
    // In a real implementation, you would update the backend
  };
  
  const handleDeviceTypeChange = (index: number, field: keyof DeviceType, value: string) => {
    const newTypes = [...editableDeviceTypes];
    newTypes[index][field] = value;
    setEditableDeviceTypes(newTypes);
  };
  
  return (
    <div className="device-list">
      <h2>Device Management</h2>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDeviceDialog()}
          sx={{ fontWeight: 'bold' }}
        >
          Add Device
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={handleOpenDeviceTypeDialog}
          sx={{ fontWeight: 'bold' }}
        >
          Add Device Type
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleExportAllDevices}
          sx={{ fontWeight: 'bold' }}
        >
          Export All Device List
        </Button>
      </Box>
      
      {/* Filter section */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 2, 
          mb: 2, 
          border: '1px solid #ddd', 
          borderRadius: '4px' 
        }}
      >
        <Typography variant="body1" gutterBottom>
          Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {/* Unified search text field */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search in Tenant, Name, Device ID, Serial No, Description"
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              InputProps={{
                startAdornment: (
                  <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
            />
          </Grid>
          
          {/* Dropdown filters */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
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
              type: "",
              status: "",
            })}
            startIcon={<FilterListIcon />}
            sx={{ fontWeight: 'bold' }}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Device Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="device list table">
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => requestSort('tenant')}
                    sx={tableHeaderCellStyle}
                  >
                    Tenant {getSortDirectionIndicator('tenant')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('name')}
                    sx={tableHeaderCellStyle}
                  >
                    Name {getSortDirectionIndicator('name')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('type')}
                    sx={tableHeaderCellStyle}
                  >
                    Type {getSortDirectionIndicator('type')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('deviceId')}
                    sx={tableHeaderCellStyle}
                  >
                    Device ID {getSortDirectionIndicator('deviceId')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('serialNo')}
                    sx={tableHeaderCellStyle}
                  >
                    Serial No. {getSortDirectionIndicator('serialNo')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('description')}
                    sx={tableHeaderCellStyle}
                  >
                    Description {getSortDirectionIndicator('description')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('status')}
                    sx={tableHeaderCellStyle}
                  >
                    Status {getSortDirectionIndicator('status')}
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Attributes</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allDevices.length > 0 ? (
                  allDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell sx={tableBodyCellStyle}>
                        {'isUnregistered' in device ? (
                          <FormControl size="small" fullWidth>
                            <Select
                              value=""
                              displayEmpty
                              onChange={(e) => {
                                const selectedTenant = tenantOptions.find(t => t.id === e.target.value);
                                if (selectedTenant) {
                                  handleAssignToTenant(
                                    device as UnregisteredDevice,
                                    selectedTenant.id,
                                    selectedTenant.name
                                  );
                                }
                              }}
                            >
                              <MenuItem value="" disabled>
                                <em>Assign to Tenant</em>
                              </MenuItem>
                              {tenantOptions.map((tenant) => (
                                <MenuItem key={tenant.id} value={tenant.id}>
                                  {tenant.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <span
                            className="clickable"
                            onClick={() => {
                              localStorage.setItem('selectedTenantId', (device as DeviceWithTenant).tenantId);
                              window.history.pushState({}, '', '/');
                              const tenantPageEvent = new CustomEvent('navigate-to-tenant', { 
                                detail: { tenantId: (device as DeviceWithTenant).tenantId } 
                              });
                              window.dispatchEvent(tenantPageEvent);
                            }}
                            style={{ cursor: 'pointer', color: 'blue' }}
                          >
                            {(device as DeviceWithTenant).tenantName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        {device.type}
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{device.deviceId}</TableCell>
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
                        <span
                          className="clickable"
                          onClick={() => handleOpenAttributesDialog(device)}
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          View ({device.attributes.length})
                        </span>
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDeviceDialog(device)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteDevice(device.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={tableBodyCellStyle}>No devices match the filter criteria</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {/* Attributes Dialog */}
      <Dialog open={openAttributesDialog} onClose={handleCloseAttributesDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Attributes for {selectedDevice?.name}
        </DialogTitle>
        <DialogContent dividers>
          {editMode ? (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeaderCellStyle}>Key</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Value</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editableAttributes.map((attr, index) => (
                      <TableRow key={index}>
                        <TableCell sx={tableBodyCellStyle}>
                          <TextField
                            fullWidth
                            size="small"
                            value={attr.key}
                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <TextField
                            fullWidth
                            size="small"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveAttribute(index)}
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={tableBodyCellStyle}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="New Key"
                          value={newAttribute.key}
                          onChange={(e) => setNewAttribute({
                            ...newAttribute,
                            key: e.target.value
                          })}
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="New Value"
                          value={newAttribute.value}
                          onChange={(e) => setNewAttribute({
                            ...newAttribute,
                            value: e.target.value
                          })}
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={handleAddAttribute}
                          disabled={!newAttribute.key.trim()}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeaderCellStyle}>Key</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDevice && selectedDevice.attributes.map((attr, index) => (
                      <TableRow key={index}>
                        <TableCell sx={tableBodyCellStyle}>{attr.key}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{attr.value}</TableCell>
                      </TableRow>
                    ))}
                    {selectedDevice && selectedDevice.attributes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={tableBodyCellStyle}>No attributes found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleCloseAttributesDialog}>Cancel</Button>
              <Button onClick={handleSaveClick} variant="contained" color="primary">Save</Button>
            </>
          ) : (
            <>
              <Button onClick={handleCloseAttributesDialog}>Close</Button>
              <Button onClick={handleEditClick} variant="contained" color="primary">Edit</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Device Dialog */}
      <Dialog open={openDeviceDialog} onClose={handleCloseDeviceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDevice ? `Edit Device: ${selectedDevice.name}` : 'Add New Device'}
        </DialogTitle>
        <DialogContent dividers>
          {editableDevice && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Device Name"
                  value={editableDevice.name}
                  onChange={(e) => setEditableDevice({
                    ...editableDevice,
                    name: e.target.value
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editableDevice.type}
                    label="Type"
                    onChange={(e) => setEditableDevice({
                      ...editableDevice,
                      type: e.target.value as "Server" | "Workstation" | "Mobile" | "IoT" | "Other"
                    })}
                  >
                    {deviceTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Device ID"
                  value={editableDevice.deviceId}
                  onChange={(e) => setEditableDevice({
                    ...editableDevice,
                    deviceId: e.target.value
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serial No."
                  value={editableDevice.serialNo}
                  onChange={(e) => setEditableDevice({
                    ...editableDevice,
                    serialNo: e.target.value
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editableDevice.description}
                  onChange={(e) => setEditableDevice({
                    ...editableDevice,
                    description: e.target.value
                  })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              {/* Status field removed as requested */}
              {/* Select Tenant field removed as requested */}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeviceDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveDevice} 
            variant="contained" 
            color="primary"
            disabled={!editableDevice || !editableDevice.name || !editableDevice.deviceId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Device Type Dialog */}
      <Dialog open={openDeviceTypeDialog} onClose={handleCloseDeviceTypeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Device Type Management
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>Type Name</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Option</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Description</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Add new device type row */}
                <TableRow>
                  <TableCell sx={tableBodyCellStyle}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="New Type Name"
                      value={newDeviceType.name}
                      onChange={(e) => setNewDeviceType({
                        ...newDeviceType,
                        name: e.target.value
                      })}
                    />
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Option"
                      value={newDeviceType.option}
                      onChange={(e) => setNewDeviceType({
                        ...newDeviceType,
                        option: e.target.value
                      })}
                    />
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Description"
                      value={newDeviceType.description}
                      onChange={(e) => setNewDeviceType({
                        ...newDeviceType,
                        description: e.target.value
                      })}
                    />
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={handleAddDeviceType}
                      disabled={!newDeviceType.name.trim()}
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
                
                {/* Existing device types */}
                {editableDeviceTypes.map((type, index) => (
                  <TableRow key={index}>
                    <TableCell sx={tableBodyCellStyle}>{type.name}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{type.option}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{type.description}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveDeviceType(index)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                
                {editableDeviceTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>No device types found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeviceTypeDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DevicePage;
