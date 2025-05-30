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
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { PaginationComponent } from '../components/tables/pagination';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { FilterSection } from '../components/tables/filter_section';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, tableContainerStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../commons/styles.js';
import { SortableTableCell } from '../components/tables/SortableTableCell';
import { useSorting } from '../hooks/useSorting';
import { Attribute, Device, DeviceWithTenant, UnregisteredDevice, DeviceType } from '../commons/models.js';
import { defaultDeviceTypes, getDeviceTypeByName } from '../mockAPI/FakerData/deviceTypes.js';
import { DeviceService, TenantService } from '../mockAPI/index.js';
import { exportToCsv } from '../commons/export_CSV.js';
import { AttributesDialog } from '../components/dialogs/AttributesDialog';
import { DeviceDialog } from '../components/dialogs/DeviceDialog';
import { DeviceTypeDialog } from '../components/dialogs/DeviceTypeDialog';
import { BulkDeviceDialog } from '../components/dialogs/BulkDeviceDialog';
import { templates } from '../commons/templates';
import { useTranslation } from "react-i18next";
import { faker } from '@faker-js/faker';

// Create service instances
const deviceService = new DeviceService();
const tenantService = new TenantService();

export const DevicePage: React.FC = () => {
  const { t } = useTranslation();
  const [allDevices, setAllDevices] = useState<(DeviceWithTenant | UnregisteredDevice)[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithTenant | UnregisteredDevice | null>(null);
  const [openAttributesDialog, setOpenAttributesDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableAttributes, setEditableAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ key: '', value: '' });
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [editableDevice, setEditableDevice] = useState<DeviceWithTenant | UnregisteredDevice | null>(null);
  const [openDeviceTypeDialog, setOpenDeviceTypeDialog] = useState(false);
  const [openBulkDeviceDialog, setOpenBulkDeviceDialog] = useState(false);
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
  
  const { sortConfig, requestSort } = useSorting();
  
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
        field: sortConfig.key === 'tenant' ? 'tenantName' : sortConfig.key,
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
      setEditableDevice(templates.createNewDevice());
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
        
        if (selectedDevice) {
          // Update existing device
          await deviceService.updateDevice(editableDevice);
        } else {
          // Add new device
          await deviceService.addDevice(editableDevice);
        }
        
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
      await deviceService.deleteDevice(deviceId);
      await loadDevices(); // Reload devices from the service
    } catch (err) {
      setError(`Error deleting device: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignToTenant = async (device: UnregisteredDevice, subscriptionId: string, tenantName: string) => {
    try {
      setLoading(true);
      await deviceService.assignDeviceToTenant(device.id, subscriptionId);
      await loadDevices(); // Reload devices from the service
    } catch (err) {
      setError(`Error assigning device to tenant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ ...pagination, page });
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
  
  const handleOpenBulkDeviceDialog = () => {
    setOpenBulkDeviceDialog(true);
  };
  
  const handleCloseBulkDeviceDialog = () => {
    setOpenBulkDeviceDialog(false);
  };
  
  const incrementValue = (value: string, type: 'Decimal' | 'Hex' | 'Alphabet', startValue: string, endValue: string): string => {
    if (type === 'Decimal') {
      const num = parseInt(value) + 1;
      const end = parseInt(endValue);
      return num > end ? startValue : num.toString();
    } else if (type === 'Hex') {
      const num = parseInt(value, 16) + 1;
      const end = parseInt(endValue, 16);
      return num > end ? startValue : num.toString(16).toUpperCase();
    } else if (type === 'Alphabet') {
      const char = value.charCodeAt(0) + 1;
      const endChar = endValue.charCodeAt(0);
      return char > endChar ? startValue : String.fromCharCode(char);
    }
    return value;
  };

  const applyZeroPadding = (value: string, digits: number, type: string): string => {
    if (digits === 0 || type === 'Alphabet') return value;
    
    if (type === 'Decimal' || type === 'Hex') {
      return value.padStart(digits, '0');
    }
    return value;
  };

  const generateDeviceNameForIndex = (template: string, fields: any[], index: number): string => {
    let result = template;
    fields.forEach(field => {
      if (field.startValue && field.name === 'field1') {
        let currentValue = field.startValue;
        for (let i = 0; i < index; i++) {
          currentValue = incrementValue(currentValue, field.type, field.startValue, field.endValue);
        }
        const paddedValue = applyZeroPadding(currentValue, field.digits || 0, field.type);
        result = result.replace(`{${field.name}}`, paddedValue);
      }
    });
    return result;
  };

  const handleSaveBulkDevice = async (deviceName: string, serialNo: string, deviceType: string, description: string, attributes: Attribute[], quantity: number, deviceNameFields?: any[], deviceNameTemplate?: string) => {
    try {
      console.log(`Creating ${quantity} devices with name: ${deviceName}, type: ${deviceType}`);
      setLoading(true);
      
      // Create multiple devices based on quantity
      for (let i = 0; i < quantity; i++) {
        let actualDeviceName = deviceName;
        if (deviceNameFields && deviceNameTemplate) {
          actualDeviceName = generateDeviceNameForIndex(deviceNameTemplate, deviceNameFields, i);
        }
        
        const newDevice: UnregisteredDevice = {
          id: faker.string.uuid(), // Auto-generated unique deviceId for each device
          name: actualDeviceName,
          type: deviceType,
          serialNo: serialNo, // From preview  
          description: description,
          status: "Registered" as const,
          attributes: attributes,
          isUnregistered: true
        };
        
        console.log(`Adding device ${i+1}/${quantity}: ${newDevice.name}`);
        await deviceService.addDevice(newDevice);
      }
      
      console.log('All devices created successfully, closing dialog');
      setOpenBulkDeviceDialog(false);
      await loadDevices(); // Reload devices from the service
    } catch (err) {
      console.error('Error creating devices:', err);
      setError(`Error adding devices: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
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
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={handleOpenBulkDeviceDialog}
          sx={{ fontWeight: 'bold' }}
        >
          {t('device.addDevice')}
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={handleOpenDeviceTypeDialog}
          sx={{ fontWeight: 'bold' }}
        >
          {t('device.addDeviceType')}
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleExportAllDevices}
          sx={{ fontWeight: 'bold' }}
        >
          {t('device.exportAllDeviceList')}
        </Button>
      </Box>
      
      {/* Filter section */}
      <FilterSection
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={() => setFilters({
          searchText: "",
          type: "",
          status: "",
        })}
        filterFields={[
          {
            type: 'text',
            key: 'searchText',
            label: t('common.search'),
            placeholder: t('device.textSearchPlaceholder'),
            startAdornment: true,
            gridSize: 4
          },
          {
            type: 'select',
            key: 'type',
            label: t('common.type'),
            options: deviceTypes,
            gridSize: 4
          },
          {
            type: 'select',
            key: 'status',
            label: t('common.status'),
            options: statusOptions,
            gridSize: 4
          }
        ]}
      />
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}
      
      {/* Pagination - Moved above the table */}
      <PaginationComponent
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        pageSizeOptions={[100, 500, 2000]}
      />
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Device Table */}
          <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
            <Table size="small" aria-label="device list table">
              <TableHead>
                <TableRow>
                  <SortableTableCell 
                    sortKey="tenant"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('common.tenant')}
                  </SortableTableCell>
                  <SortableTableCell 
                    sortKey="name"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('common.name')}
                  </SortableTableCell>
                  <SortableTableCell 
                    sortKey="type"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('common.type')}
                  </SortableTableCell>
                  <SortableTableCell 
                    sortKey="deviceId"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('device.deviceId')}
                  </SortableTableCell>
                  <SortableTableCell 
                    sortKey="serialNo"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('device.serialNo')}
                  </SortableTableCell>
                  <SortableTableCell 
                    sortKey="description"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('common.description')}
                  </SortableTableCell>
                  <SortableTableCell 
                    sortKey="status"
                    sortConfig={sortConfig}
                    onRequestSort={requestSort}
                    sx={tableHeaderCellStyle}
                  >
                    {t('common.status')}
                  </SortableTableCell>
                  <TableCell sx={tableHeaderCellStyle}>{t('device.attributes')}</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>{t('common.actions')}</TableCell>
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
                                <em>{t('device.assignToTenant')}</em>
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
                              localStorage.setItem('selectedTenantId', (device as DeviceWithTenant).subscriptionId);
                              window.history.pushState({}, '', '/');
                              const tenantPageEvent = new CustomEvent('navigate-to-tenant', { 
                                detail: { subscriptionId: (device as DeviceWithTenant).subscriptionId } 
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
                              {device.attributes.map((attr, index) => (
                                <ListItem key={index}>
                                  <ListItemText primary={`${attr.key}: ${attr.value}`} />
                                </ListItem>
                              ))}
                            </List>
                          }>
                          <span
                            className="clickable"
                            onClick={() => handleOpenAttributesDialog(device)}
                            style={{ cursor: 'pointer', color: 'blue' }}
                          >
                            View ({device.attributes.length})
                          </span>
                        </Tooltip>
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
      <AttributesDialog
        open={openAttributesDialog}
        onClose={handleCloseAttributesDialog}
        device={selectedDevice}
        editableAttributes={editableAttributes}
        editMode={editMode}
        newAttribute={newAttribute}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        onAddAttribute={handleAddAttribute}
        onRemoveAttribute={handleRemoveAttribute}
        onAttributeChange={handleAttributeChange}
        onNewAttributeChange={(field, value) => setNewAttribute({
          ...newAttribute,
          [field]: value
        })}
      />
      
      {/* Device Dialog */}
      <DeviceDialog
        open={openDeviceDialog}
        onClose={handleCloseDeviceDialog}
        device={selectedDevice}
        editableDevice={editableDevice}
        deviceTypes={deviceTypes}
        onSave={handleSaveDevice}
        onDeviceChange={setEditableDevice}
      />
      
      {/* Device Type Dialog */}
      <DeviceTypeDialog
        open={openDeviceTypeDialog}
        onClose={handleCloseDeviceTypeDialog}
        deviceTypes={editableDeviceTypes}
        newDeviceType={newDeviceType}
        onAddDeviceType={handleAddDeviceType}
        onRemoveDeviceType={handleRemoveDeviceType}
        onDeviceTypeChange={handleDeviceTypeChange}
        onNewDeviceTypeChange={(field, value) => setNewDeviceType({
          ...newDeviceType,
          [field]: value
        })}
      />
      
      {/* Bulk Device Dialog */}
      <BulkDeviceDialog
        open={openBulkDeviceDialog}
        onClose={handleCloseBulkDeviceDialog}
        deviceTypes={deviceTypes}
        onSave={handleSaveBulkDevice}
      />
    </div>
  );
};
