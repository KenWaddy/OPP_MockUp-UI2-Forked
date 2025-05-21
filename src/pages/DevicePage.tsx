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
  Chip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { mockTenants } from "./TenantPage";

const tableHeaderCellStyle = {
  fontWeight: 'bold',
  fontSize: '0.875rem',
  color: '#333',
  cursor: 'pointer',
};

const tableBodyCellStyle = {
  fontSize: '0.875rem',
  color: '#333',
};

type Attribute = {
  key: string;
  value: string;
};

type Device = {
  id: string;
  name: string;
  type: "Server" | "Workstation" | "Mobile" | "IoT" | "Other";
  deviceId: string;
  serialNo: string;
  description: string;
  status: "Registered" | "Activated";
  attributes: Attribute[];
};

type DeviceWithTenant = Device & {
  tenantId: string;
  tenantName: string;
};

type UnregisteredDevice = Omit<DeviceWithTenant, "tenantId" | "tenantName"> & {
  isUnregistered: true;
};

export const DevicePage: React.FC = () => {
  const [allDevices, setAllDevices] = useState<(DeviceWithTenant | UnregisteredDevice)[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithTenant | UnregisteredDevice | null>(null);
  const [openAttributesDialog, setOpenAttributesDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableAttributes, setEditableAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ key: '', value: '' });
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [editableDevice, setEditableDevice] = useState<DeviceWithTenant | UnregisteredDevice | null>(null);
  const [tenantOptions, setTenantOptions] = useState<{id: string, name: string}[]>([]);
  
  const [filters, setFilters] = useState<{
    tenant: string;
    name: string;
    type: string;
    deviceId: string;
    serialNo: string;
    description: string;
    status: string;
  }>({
    tenant: "",
    name: "",
    type: "",
    deviceId: "",
    serialNo: "",
    description: "",
    status: "",
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const deviceTypes: Device["type"][] = ["Server", "Workstation", "Mobile", "IoT", "Other"];
  const statusOptions: Device["status"][] = ["Registered", "Activated"];
  
  useEffect(() => {
    const devicesWithTenantInfo: DeviceWithTenant[] = [];
    const tenants: {id: string, name: string}[] = [];
    
    mockTenants.forEach(tenant => {
      tenants.push({id: tenant.id, name: tenant.name});
      
      if (tenant.devices) {
        tenant.devices.forEach(device => {
          devicesWithTenantInfo.push({
            ...device,
            tenantId: tenant.id,
            tenantName: tenant.name
          });
        });
      }
    });
    
    const unregisteredDevices: UnregisteredDevice[] = [
      {
        id: "unreg-1",
        name: "New Server",
        type: "Server",
        deviceId: "SRV-NEW-001",
        serialNo: "NEW123456",
        description: "New server awaiting registration",
        status: "Registered",
        attributes: [
          { key: "CPU", value: "24 cores" },
          { key: "RAM", value: "128GB" }
        ],
        isUnregistered: true
      },
      {
        id: "unreg-2",
        name: "New Workstation",
        type: "Workstation",
        deviceId: "WS-NEW-001",
        serialNo: "NEW654321",
        description: "New workstation awaiting registration",
        status: "Registered",
        attributes: [
          { key: "CPU", value: "8 cores" },
          { key: "RAM", value: "32GB" }
        ],
        isUnregistered: true
      }
    ];
    
    setAllDevices([...devicesWithTenantInfo, ...unregisteredDevices]);
    setTenantOptions(tenants);
  }, []);
  
  const handleOpenAttributesDialog = (device: DeviceWithTenant | UnregisteredDevice) => {
    setSelectedDevice(device);
    setEditableAttributes(device.attributes.map(attr => ({ ...attr })));
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
  
  const handleSaveClick = () => {
    if (selectedDevice) {
      const updatedDevices = allDevices.map(device => 
        device.id === selectedDevice.id 
          ? { ...device, attributes: editableAttributes } 
          : device
      );
      setAllDevices(updatedDevices);
      setSelectedDevice({ ...selectedDevice, attributes: editableAttributes });
      setEditMode(false);
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
  
  const handleSaveDevice = () => {
    if (editableDevice) {
      let updatedDevices;
      
      if (selectedDevice) {
        updatedDevices = allDevices.map(device => 
          device.id === selectedDevice.id 
            ? editableDevice 
            : device
        );
      } else {
        updatedDevices = [...allDevices, editableDevice];
      }
      
      setAllDevices(updatedDevices);
      setOpenDeviceDialog(false);
    }
  };
  
  const handleDeleteDevice = (deviceId: string) => {
    const updatedDevices = allDevices.filter(device => device.id !== deviceId);
    setAllDevices(updatedDevices);
  };
  
  const handleAssignToTenant = (device: UnregisteredDevice, tenantId: string, tenantName: string) => {
    const updatedDevices = allDevices.map(d => {
      if (d.id === device.id) {
        const { isUnregistered, ...deviceWithoutFlag } = d as UnregisteredDevice;
        return {
          ...deviceWithoutFlag,
          tenantId,
          tenantName
        } as DeviceWithTenant;
      }
      return d;
    });
    setAllDevices(updatedDevices);
  };
  
  const getFilteredAndSortedDevices = () => {
    let filteredDevices = [...allDevices];
    
    if (filters.tenant) {
      filteredDevices = filteredDevices.filter(device => {
        if ('isUnregistered' in device) {
          return false; // Unregistered devices don't have a tenant
        }
        return (device as DeviceWithTenant).tenantName.toLowerCase().includes(filters.tenant.toLowerCase());
      });
    }
    
    if (filters.name) {
      filteredDevices = filteredDevices.filter(
        device => device.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.type) {
      filteredDevices = filteredDevices.filter(
        device => device.type === filters.type
      );
    }
    
    if (filters.deviceId) {
      filteredDevices = filteredDevices.filter(
        device => device.deviceId.toLowerCase().includes(filters.deviceId.toLowerCase())
      );
    }
    
    if (filters.serialNo) {
      filteredDevices = filteredDevices.filter(
        device => device.serialNo.toLowerCase().includes(filters.serialNo.toLowerCase())
      );
    }
    
    if (filters.description) {
      filteredDevices = filteredDevices.filter(
        device => device.description.toLowerCase().includes(filters.description.toLowerCase())
      );
    }
    
    if (filters.status) {
      filteredDevices = filteredDevices.filter(
        device => device.status === filters.status
      );
    }
    
    if (sortConfig) {
      filteredDevices.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortConfig.key) {
          case 'tenant':
            valueA = 'isUnregistered' in a ? '' : (a as DeviceWithTenant).tenantName;
            valueB = 'isUnregistered' in b ? '' : (b as DeviceWithTenant).tenantName;
            break;
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'type':
            valueA = a.type;
            valueB = b.type;
            break;
          case 'deviceId':
            valueA = a.deviceId;
            valueB = b.deviceId;
            break;
          case 'serialNo':
            valueA = a.serialNo;
            valueB = b.serialNo;
            break;
          case 'description':
            valueA = a.description;
            valueB = b.description;
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
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
    
    return filteredDevices;
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
  
  return (
    <div className="device-list">
      <h2>Device Management</h2>
      
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDeviceDialog()}
          >
            Add Device
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
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Tenant"
              value={filters.tenant}
              onChange={(e) => setFilters({ ...filters, tenant: e.target.value })}
            />
          </Grid>
          
          {/* Text input filters */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Device ID"
              value={filters.deviceId}
              onChange={(e) => setFilters({ ...filters, deviceId: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Serial No."
              value={filters.serialNo}
              onChange={(e) => setFilters({ ...filters, serialNo: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Description"
              value={filters.description}
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setFilters({
              tenant: "",
              name: "",
              type: "",
              deviceId: "",
              serialNo: "",
              description: "",
              status: "",
            })}
            startIcon={<FilterListIcon />}
          >
            Reset Filters
          </Button>
        </Box>
      </Paper>
      
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
            {getFilteredAndSortedDevices().length > 0 ? (
              getFilteredAndSortedDevices().map((device) => (
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
                          const tenant = mockTenants.find(t => t.id === (device as DeviceWithTenant).tenantId);
                          if (tenant) {
                            window.history.pushState({}, '', '/');
                            const tenantPageEvent = new CustomEvent('navigate-to-tenant', { 
                              detail: { tenant } 
                            });
                            window.dispatchEvent(tenantPageEvent);
                          }
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
                    {device.status}
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <span
                      className="clickable"
                      onClick={() => handleOpenAttributesDialog(device)}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      View
                    </span>
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <span
                      className="clickable"
                      onClick={() => handleOpenDeviceDialog(device)}
                      style={{ cursor: 'pointer', color: 'blue', marginRight: '8px' }}
                    >
                      Edit
                    </span>
                    <span
                      className="clickable"
                      onClick={() => handleDeleteDevice(device.id)}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      Delete
                    </span>
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
      
      {/* Attributes Dialog */}
      <Dialog open={openAttributesDialog} onClose={handleCloseAttributesDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Attributes for {selectedDevice?.name}
        </DialogTitle>
        <DialogContent dividers>
          {editMode ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-end' }}>
                <TextField
                  label="Key"
                  value={newAttribute.key}
                  onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })}
                  sx={{ mr: 1, flex: 1 }}
                  size="small"
                />
                <TextField
                  label="Value"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                  sx={{ mr: 1, flex: 1 }}
                  size="small"
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddAttribute}
                  disabled={!newAttribute.key.trim()}
                >
                  Add
                </Button>
              </Box>
              {editableAttributes.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeaderCellStyle}>Key</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Value</TableCell>
                        <TableCell sx={tableHeaderCellStyle} width={50}></TableCell>
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
                              edge="end"
                              onClick={() => handleRemoveAttribute(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attributes found. Add some using the form above.
                </Typography>
              )}
            </>
          ) : (
            <>
              {selectedDevice && selectedDevice.attributes.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeaderCellStyle}>Key</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDevice.attributes.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell sx={tableBodyCellStyle}>{attr.key}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{attr.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attributes found
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={handleSaveClick} color="primary">
                Save
              </Button>
              <Button onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEditClick} color="primary">
                Edit
              </Button>
              <Button onClick={handleCloseAttributesDialog}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Device Dialog */}
      <Dialog open={openDeviceDialog} onClose={handleCloseDeviceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDevice ? 'Edit Device' : 'Add New Device'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                required
                value={editableDevice?.name || ''}
                onChange={(e) => setEditableDevice({...editableDevice!, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={editableDevice?.type || 'Server'}
                  onChange={(e) => setEditableDevice({...editableDevice!, type: e.target.value as Device["type"]})}
                  label="Type"
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Device ID"
                required
                value={editableDevice?.deviceId || ''}
                onChange={(e) => setEditableDevice({...editableDevice!, deviceId: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Serial No."
                value={editableDevice?.serialNo || ''}
                onChange={(e) => setEditableDevice({...editableDevice!, serialNo: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                multiline
                rows={2}
                value={editableDevice?.description || ''}
                onChange={(e) => setEditableDevice({...editableDevice!, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editableDevice?.status || 'Registered'}
                  onChange={(e) => setEditableDevice({...editableDevice!, status: e.target.value as Device["status"]})}
                  label="Status"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {'isUnregistered' in (editableDevice || {}) && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Assign to Tenant</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      const selectedTenant = tenantOptions.find(t => t.id === e.target.value);
                      if (selectedTenant && editableDevice && 'isUnregistered' in editableDevice) {
                        const { isUnregistered, ...deviceWithoutFlag } = editableDevice as UnregisteredDevice;
                        setEditableDevice({
                          ...deviceWithoutFlag,
                          tenantId: selectedTenant.id,
                          tenantName: selectedTenant.name
                        } as DeviceWithTenant);
                      }
                    }}
                    label="Assign to Tenant"
                  >
                    <MenuItem value="" disabled>
                      <em>Select a tenant</em>
                    </MenuItem>
                    {tenantOptions.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDevice} color="primary">
            Save
          </Button>
          <Button onClick={handleCloseDeviceDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};
