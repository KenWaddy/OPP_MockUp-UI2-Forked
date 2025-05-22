import React, { useState, useEffect } from "react";
import {
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
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
  Switch,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Tabs,
  Tab,
  Pagination,
  CircularProgress,
  Alert
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../styles/common.js';
import { Tenant, User, Device, Attribute, DeviceContractItem } from '../mocks/index.js';
import { TenantService, UserService } from '../services/index.js';
import { exportToCsv } from '../utils/exportUtils.js';

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();

export const TenantPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [editableTenant, setEditableTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100, // Default to 100 rows
    total: 0,
    totalPages: 0
  });
  
  useEffect(() => {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (selectedTenantId) {
      loadTenantById(selectedTenantId);
      localStorage.removeItem('selectedTenantId');
    }
  }, []);
  
  const loadTenantById = async (id: string) => {
    try {
      setLoading(true);
      const response = await tenantService.getTenantById(id, true, true, true);
      if (response.success && response.data) {
        setSelectedTenant(response.data);
      }
    } catch (err) {
      setError(`Error loading tenant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const [filters, setFilters] = useState<{
    contractType: string;
    billingType: string;
    status: string;
    textSearch: string;
  }>({
    contractType: "",
    billingType: "",
    status: "",
    textSearch: "",
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Load tenants with pagination, filtering, and sorting
  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert filters to the format expected by the service
      const serviceFilters: Record<string, any> = {};
      if (filters.contractType) serviceFilters.contract = filters.contractType;
      if (filters.billingType) serviceFilters.billing = filters.billingType;
      if (filters.status) serviceFilters.status = filters.status;
      if (filters.textSearch) serviceFilters.textSearch = filters.textSearch;
      
      // Convert sort config to the format expected by the service
      const serviceSort = sortConfig ? {
        field: sortConfig.key === 'tenant' ? 'name' : 
               sortConfig.key === 'owner' ? 'owner' : 
               sortConfig.key === 'email' ? 'email' : 
               sortConfig.key,
        order: sortConfig.direction === 'ascending' ? 'asc' : 'desc' as 'asc' | 'desc'
      } : undefined;
      
      const response = await tenantService.getTenants({
        page: pagination.page,
        limit: pagination.limit,
        filters: serviceFilters,
        sort: serviceSort
      });
      
      setTenants(response.data);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });
    } catch (err) {
      setError(`Error loading tenants: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load tenants when component mounts, pagination changes, or filters/sort changes
  useEffect(() => {
    loadTenants();
  }, [pagination.page, pagination.limit, filters, sortConfig]);
  
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
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  
  const handleOpenTenantDialog = (tenant?: Tenant) => {
    if (tenant) {
      setSelectedTenant(tenant);
      setEditableTenant({...tenant});
    } else {
      setSelectedTenant(null);
      setEditableTenant({
        id: `t-new-${Math.floor(Math.random() * 1000)}`,
        name: '',
        description: '',
        owner: {
          name: '',
          email: '',
          phone: '',
          address: '',
          country: ''
        },
        contract: "Evergreen",
        status: "Active",
        billing: "Monthly",
        billingDetails: [],
        subscription: {
          name: '',
          id: '',
          description: '',
          services: [],
          termType: "Annual",
          status: "Active",
          startDate: '',
          endDate: '',
          configs: ''
        },
        users: [],
        devices: []
      });
    }
    setOpenTenantDialog(true);
  };
  
  const handleCloseTenantDialog = () => {
    setOpenTenantDialog(false);
  };
  
  const handleSaveTenant = async () => {
    if (editableTenant) {
      try {
        setLoading(true);
        // In a real implementation, this would call a service method to save the tenant
        // For now, we'll just update the local state
        if (selectedTenant) {
          // Update existing tenant
          const updatedTenants = tenants.map(tenant => 
            tenant.id === selectedTenant.id 
              ? editableTenant 
              : tenant
          );
          setTenants(updatedTenants);
        } else {
          // Add new tenant
          setTenants([...tenants, editableTenant]);
        }
        
        setOpenTenantDialog(false);
        await loadTenants(); // Reload tenants from the service
      } catch (err) {
        setError(`Error saving tenant: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDeleteTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      // In a real implementation, this would call a service method to delete the tenant
      // For now, we'll just update the local state
      const updatedTenants = tenants.filter(tenant => tenant.id !== tenantId);
      setTenants(updatedTenants);
      
      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(null);
      }
      
      await loadTenants(); // Reload tenants from the service
    } catch (err) {
      setError(`Error deleting tenant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
  };
  
  const handleExportAllTenants = async () => {
    try {
      setLoading(true);
      const allTenants = await tenantService.getAllTenants();
      
      const headers = [
        'id', 'name', 'description', 
        'owner.name', 'owner.email', 'owner.phone', 'owner.address', 'owner.country',
        'contract', 'status', 'billing'
      ];
      
      exportToCsv(allTenants, 'tenant-list-export.csv', headers);
    } catch (err) {
      setError(`Error exporting tenants: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportAllUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      
      const usersForExport = allUsers.map(user => {
        const rolesFormatted = user.roles.join(', ');
        const ipWhitelistFormatted = user.ipWhitelist.join(', ');
        
        return {
          ...user,
          roles: rolesFormatted,
          ipWhitelist: ipWhitelistFormatted
        };
      });
      
      const headers = [
        'id', 'tenantName', 'name', 'email', 'roles', 'ipWhitelist', 'mfaEnabled'
      ];
      
      exportToCsv(usersForExport, 'user-list-export.csv', headers);
    } catch (err) {
      setError(`Error exporting users: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const contractTypeOptions = ["Evergreen", "Fixed-term", "Trial"];
  const billingTypeOptions = ["Monthly", "Annually", "One-time"];
  const statusOptions = ["Active", "Inactive", "Pending", "Suspended"];
  
  return (
    <div className="tenant-list">
      <h2>Tenant Management</h2>
      
      {selectedTenant ? (
        <Paper sx={{ p: 2 }} variant="outlined">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{selectedTenant.name}</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setSelectedTenant(null)}
            >
              Back to List
            </Button>
          </Box>
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="tenant detail tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab value="info" label="Tenant Info" />
            <Tab value="users" label="Users" />
            <Tab value="devices" label="Devices" />
            <Tab value="billing" label="Billing" />
          </Tabs>
          
          {/* Tenant Info Tab */}
          {activeTab === "info" && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={paperStyle} variant="outlined">
                  <Typography sx={primaryTypographyStyle}>Basic Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>ID:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.id}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Name:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.name}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Description:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.description}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Contract:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contract}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Status:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip 
                        label={selectedTenant.status} 
                        color={
                          selectedTenant.status === "Active" ? "success" : 
                          selectedTenant.status === "Inactive" ? "error" : 
                          selectedTenant.status === "Pending" ? "warning" : 
                          "default"
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Billing:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.billing}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={paperStyle} variant="outlined">
                  <Typography sx={primaryTypographyStyle}>Owner Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Name:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.owner.name}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Email:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.owner.email}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Phone:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.owner.phone || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Address:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.owner.address || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={secondaryTypographyStyle}>Country:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.owner.country || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={paperStyle} variant="outlined">
                  <Typography sx={primaryTypographyStyle}>Subscription</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={secondaryTypographyStyle}>Name:</Typography>
                      <Typography>{selectedTenant.subscription?.name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={secondaryTypographyStyle}>ID:</Typography>
                      <Typography>{selectedTenant.subscription?.id || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={secondaryTypographyStyle}>Term Type:</Typography>
                      <Typography>{selectedTenant.subscription?.termType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={secondaryTypographyStyle}>Status:</Typography>
                      <Chip 
                        label={selectedTenant.subscription?.status || 'N/A'} 
                        color={
                          selectedTenant.subscription?.status === "Active" ? "success" : 
                          selectedTenant.subscription?.status === "Inactive" ? "error" : 
                          "default"
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={secondaryTypographyStyle}>Start Date:</Typography>
                      <Typography>{selectedTenant.subscription?.startDate || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={secondaryTypographyStyle}>End Date:</Typography>
                      <Typography>{selectedTenant.subscription?.endDate || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={secondaryTypographyStyle}>Description:</Typography>
                      <Typography>{selectedTenant.subscription?.description || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={secondaryTypographyStyle}>Services:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {selectedTenant.subscription?.services?.map((service, index) => (
                          <Chip key={index} label={service} size="small" />
                        )) || 'N/A'}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={secondaryTypographyStyle}>Configuration:</Typography>
                      <Typography>{selectedTenant.subscription?.configs || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Users Tab */}
          {activeTab === "users" && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Roles</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>IP Whitelist</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>MFA</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTenant.users && selectedTenant.users.length > 0 ? (
                    selectedTenant.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell sx={tableBodyCellStyle}>{user.name}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{user.email}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.roles.map((role, index) => (
                              <Chip key={index} label={role} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          {user.ipWhitelist.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {user.ipWhitelist.map((ip, index) => (
                                <Chip key={index} label={ip} size="small" />
                              ))}
                            </Box>
                          ) : (
                            'None'
                          )}
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <Chip 
                            label={user.mfaEnabled ? 'Enabled' : 'Disabled'} 
                            color={user.mfaEnabled ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={tableBodyCellStyle}>No users found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Devices Tab */}
          {activeTab === "devices" && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Device ID</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Serial No.</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Description</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Attributes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTenant.devices && selectedTenant.devices.length > 0 ? (
                    selectedTenant.devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{device.deviceId}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{device.serialNo}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{device.description}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <Chip 
                            label={device.status} 
                            color={device.status === "Activated" ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <Tooltip title={
                            <List dense>
                              {device.attributes.map((attr, index) => (
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={tableBodyCellStyle}>No devices found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div>
              {selectedTenant.billingDetails && selectedTenant.billingDetails.length > 0 ? (
                selectedTenant.billingDetails.map((billing, index) => (
                  <Paper key={index} sx={{ ...paperStyle, mb: 2 }} variant="outlined">
                    <Typography sx={primaryTypographyStyle}>
                      Billing ID: {billing.billingId}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={secondaryTypographyStyle}>Payment Type:</Typography>
                        <Typography>{billing.paymentType}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={secondaryTypographyStyle}>Start Date:</Typography>
                        <Typography>{billing.startDate}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={secondaryTypographyStyle}>End Date:</Typography>
                        <Typography>{billing.endDate || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={secondaryTypographyStyle}>Due Day:</Typography>
                        <Typography>
                          {billing.dueDay ? 
                            (billing.dueDay === "End of Month" ? 
                              "End of Month" : 
                              `Day ${billing.dueDay}${billing.dueMonth ? ` of month ${billing.dueMonth}` : ''}`) : 
                            'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography sx={secondaryTypographyStyle}>Device Contracts:</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                                <TableCell sx={tableHeaderCellStyle}>Quantity</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {billing.deviceContract && billing.deviceContract.map((contract, idx) => (
                                <TableRow key={idx}>
                                  <TableCell sx={tableBodyCellStyle}>{contract.type}</TableCell>
                                  <TableCell sx={tableBodyCellStyle}>{contract.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              ) : (
                <Typography align="center">No billing details found</Typography>
              )}
            </div>
          )}
        </Paper>
      ) : (
        <>
          {/* Add Tenant Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenTenantDialog()}
            >
              Add Tenant
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleExportAllTenants}
            >
              Export All Tenant List
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleExportAllUsers}
            >
              Export All User List
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
              {/* Text input filter */}
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Text Search"
                  placeholder="Search by Tenant Name, Owner Name, or Email Address"
                  value={filters.textSearch}
                  onChange={(e) => setFilters({ ...filters, textSearch: e.target.value })}
                />
              </Grid>

          {/* Dropdown filters */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Contract Type</InputLabel>
              <Select
                value={filters.contractType}
                label="Contract Type"
                onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {contractTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
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
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Billing Type</InputLabel>
              <Select
                value={filters.billingType}
                label="Billing Type"
                onChange={(e) => setFilters({ ...filters, billingType: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {billingTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
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
                  contractType: "",
                  billingType: "",
                  status: "",
                  textSearch: "",
                })}
                startIcon={<FilterListIcon />}
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
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
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
          {/* Tenant Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="tenant list table">
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => requestSort('tenant')}
                    sx={tableHeaderCellStyle}
                  >
                    Tenant {getSortDirectionIndicator('tenant')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('owner')}
                    sx={tableHeaderCellStyle}
                  >
                    Owner {getSortDirectionIndicator('owner')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('email')}
                    sx={tableHeaderCellStyle}
                  >
                    Email {getSortDirectionIndicator('email')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('contract')}
                    sx={tableHeaderCellStyle}
                  >
                    Contract {getSortDirectionIndicator('contract')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('status')}
                    sx={tableHeaderCellStyle}
                  >
                    Status {getSortDirectionIndicator('status')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('billing')}
                    sx={tableHeaderCellStyle}
                  >
                    Billing {getSortDirectionIndicator('billing')}
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell sx={tableBodyCellStyle}>
                        <span
                          className="clickable"
                          onClick={() => loadTenantById(tenant.id)}
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          {tenant.name}
                        </span>
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{tenant.owner.name}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{tenant.owner.email}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{tenant.contract}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <Chip 
                          label={tenant.status} 
                          color={
                            tenant.status === "Active" ? "success" : 
                            tenant.status === "Inactive" ? "error" : 
                            tenant.status === "Pending" ? "warning" : 
                            "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{tenant.billing}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenTenantDialog(tenant)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteTenant(tenant.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={tableBodyCellStyle}>No tenants match the filter criteria</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      </>
      )}
      
      {/* Tenant Dialog */}
      <Dialog 
        open={openTenantDialog} 
        onClose={handleCloseTenantDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editableTenant ? (editableTenant.id ? `Edit Tenant: ${editableTenant.name}` : 'Add New Tenant') : 'Tenant'}
        </DialogTitle>
        <DialogContent dividers>
          {editableTenant && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenant Name"
                  value={editableTenant.name}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    name: e.target.value
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editableTenant.status}
                    label="Status"
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      status: e.target.value
                    })}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editableTenant.description}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    description: e.target.value
                  })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Contract Type</InputLabel>
                  <Select
                    value={editableTenant.contract}
                    label="Contract Type"
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contract: e.target.value
                    })}
                  >
                    {contractTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Billing Type</InputLabel>
                  <Select
                    value={editableTenant.billing}
                    label="Billing Type"
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      billing: e.target.value
                    })}
                  >
                    {billingTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Owner Information
                </Typography>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  value={editableTenant.owner.name}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    owner: {
                      ...editableTenant.owner,
                      name: e.target.value
                    }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editableTenant.owner.email}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    owner: {
                      ...editableTenant.owner,
                      email: e.target.value
                    }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editableTenant.owner.phone}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    owner: {
                      ...editableTenant.owner,
                      phone: e.target.value
                    }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={editableTenant.owner.country}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    owner: {
                      ...editableTenant.owner,
                      country: e.target.value
                    }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editableTenant.owner.address}
                  onChange={(e) => setEditableTenant({
                    ...editableTenant,
                    owner: {
                      ...editableTenant.owner,
                      address: e.target.value
                    }
                  })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTenantDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveTenant} 
            variant="contained" 
            color="primary"
            disabled={!editableTenant || !editableTenant.name || !editableTenant.owner.name || !editableTenant.owner.email}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
