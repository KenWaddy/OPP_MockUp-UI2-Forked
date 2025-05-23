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
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle } from '../styles/common.js';
import { Tenant, User, Device, Attribute, DeviceContractItem, UnregisteredDevice, defaultDeviceTypes } from '../mocks/index.js';
import { TenantService, UserService, DeviceService } from '../services/index.js';
import { exportToCsv } from '../utils/exportUtils.js';

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();

const calculateNextBillingMonth = (billing: any) => {
  if (!billing) return '—';

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  if (billing.endDate) {
    try {
      const endDate = new Date(billing.endDate);
      const currentDate = new Date();

      if (currentDate > endDate) {
        return 'Ended';
      }
    } catch (e) {
    }
  }

  if (billing.paymentType === 'Monthly') {
    let nextBillingYear = currentYear;
    let nextBillingMonth = currentMonth;

    return `${nextBillingYear}-${String(nextBillingMonth + 1).padStart(2, '0')}`;
  }
  else if (billing.paymentType === 'Annually') {
    if (!billing.endDate) return '—';

    try {
      const endDate = new Date(billing.endDate);
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth(); // 0-11

      return `${endYear}-${String(endMonth + 1).padStart(2, '0')}`;
    } catch (e) {
      return '—';
    }
  }
  else if (billing.paymentType === 'One-time') {
    if (!billing.startDate) return '—';

    try {
      const startDate = new Date(billing.startDate);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth(); // 0-11

      return `${startYear}-${String(startMonth + 1).padStart(2, '0')}`;
    } catch (e) {
      return '—';
    }
  }

  return '—'; // Default for unknown payment types
};

export const TenantPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [editableTenant, setEditableTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDeviceAssignDialog, setOpenDeviceAssignDialog] = useState(false);
  const [unassignedDevices, setUnassignedDevices] = useState<UnregisteredDevice[]>([]);
  const [selectedUnassignedDevices, setSelectedUnassignedDevices] = useState<string[]>([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [openBillingDialog, setOpenBillingDialog] = useState(false);
  const [editableBilling, setEditableBilling] = useState<NonNullable<Tenant["billingDetails"]>[0] | null>(null);
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

      // In a real implementation, this would call a service method to assign devices to tenant
      // For now, we'll just update the local state
      const devicesToAssign = unassignedDevices.filter(device =>
        selectedUnassignedDevices.includes(device.id)
      );

      const updatedDevices = [
        ...(selectedTenant.devices || []),
        ...devicesToAssign.map(({ isUnregistered, ...deviceData }) => ({
          ...deviceData,
          status: "Assigned" as const // Set status to Assigned when device is assigned to a tenant
        })) as Device[]
      ];

      setSelectedTenant({
        ...selectedTenant,
        devices: updatedDevices
      });

      setOpenDeviceAssignDialog(false);

      // In a real implementation, we would reload the tenant data from the server
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

      // In a real implementation, this would call a service method to unassign the device
      // For now, we'll just update the local state
      const updatedDevices = selectedTenant.devices?.filter(device => device.id !== deviceId) || [];

      setSelectedTenant({
        ...selectedTenant,
        devices: updatedDevices
      });

      // In a real implementation, we would reload the tenant data from the server
    } catch (err) {
      setError(`Error unassigning device: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUserDialog = () => {
    if (!selectedTenant) return;

    // Check if this is the first user being added to the tenant
    const isFirstUser = !selectedTenant.users || selectedTenant.users.length === 0;

    setEditableUser({
      id: `u-new-${Math.floor(Math.random() * 1000)}`,
      name: '',
      email: '',
      roles: isFirstUser ? ['Owner'] : ['Member'], // Set 'Owner' role for first user, otherwise 'Member'
      ipWhitelist: [],
      mfaEnabled: false
    });

    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleSaveUser = () => {
    if (!selectedTenant || !editableUser) return;

    try {
      setLoading(true);

      const existingUserIndex = selectedTenant.users?.findIndex(user => user.id === editableUser.id) ?? -1;
      
      if (existingUserIndex >= 0) {
        // Update existing user
        const updatedUsers = [...(selectedTenant.users || [])];
        updatedUsers[existingUserIndex] = editableUser;
        
        setSelectedTenant({
          ...selectedTenant,
          users: updatedUsers
        });
      } else {
        // Add new user
        const updatedUsers = [
          ...(selectedTenant.users || []),
          editableUser
        ];

        setSelectedTenant({
          ...selectedTenant,
          users: updatedUsers
        });
      }

      setOpenUserDialog(false);
    } catch (err) {
      setError(`Error saving user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    if (!selectedTenant) return;

    setEditableUser({
      ...user
    });

    setOpenUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (!selectedTenant) return;

    const userToDelete = selectedTenant.users?.find(user => user.id === userId);
    
    if (userToDelete && userToDelete.roles.includes('Owner')) {
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, this would call a service method to delete the user
      // For now, we'll just update the local state
      const updatedUsers = selectedTenant.users?.filter(user => user.id !== userId) || [];

      setSelectedTenant({
        ...selectedTenant,
        users: updatedUsers
      });
    } catch (err) {
      setError(`Error deleting user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBillingDialog = () => {
    if (!selectedTenant) return;

    setEditableBilling({
      billingId: `BID-${Math.floor(Math.random() * 1000)}`,
      paymentType: "Monthly",
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      dueDay: 15,
      deviceContract: [{ type: defaultDeviceTypes[0].name, quantity: 1 }],
      description: ''
    });

    setOpenBillingDialog(true);
  };

  const handleCloseBillingDialog = () => {
    setOpenBillingDialog(false);
  };


  const handleSaveBilling = () => {
    if (!selectedTenant || !editableBilling) return;

    try {
      setLoading(true);

      const existingBillingIndex = selectedTenant.billingDetails?.findIndex(billing => billing.billingId === editableBilling.billingId) ?? -1;
      
      if (existingBillingIndex >= 0) {
        // Update existing billing detail
        const updatedBillingDetails = [...(selectedTenant.billingDetails || [])];
        updatedBillingDetails[existingBillingIndex] = editableBilling;
        
        setSelectedTenant({
          ...selectedTenant,
          billingDetails: updatedBillingDetails
        });
      } else {
        // Add new billing detail
        const updatedBillingDetails = [
          ...(selectedTenant.billingDetails || []),
          editableBilling
        ];

        setSelectedTenant({
          ...selectedTenant,
          billingDetails: updatedBillingDetails
        });
      }

      setOpenBillingDialog(false);
    } catch (err) {
      setError(`Error saving billing: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBilling = (billing: NonNullable<Tenant["billingDetails"]>[0]) => {
    if (!selectedTenant) return;

    setEditableBilling({
      ...billing
    });

    setOpenBillingDialog(true);
  };

  const handleDeleteBilling = (billingId: string) => {
    if (!selectedTenant) return;

    try {
      setLoading(true);

      // In a real implementation, this would call a service method to delete the billing
      // For now, we'll just update the local state
      const updatedBillingDetails = selectedTenant.billingDetails?.filter(billing => billing.billingId !== billingId) || [];

      setSelectedTenant({
        ...selectedTenant,
        billingDetails: updatedBillingDetails
      });
    } catch (err) {
      setError(`Error deleting billing: ${err instanceof Error ? err.message : String(err)}`);
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
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenUserDialog}
                >
                  Add User
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Email</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Roles</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>IP Whitelist</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>MFA</TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
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
                        <TableCell sx={tableBodyCellStyle}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <Tooltip title={user.roles.includes('Owner') ? "Owner users cannot be deleted" : ""}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user.id)}
                                aria-label="delete"
                                disabled={user.roles.includes('Owner')}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
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
            </>
          )}

          {/* Devices Tab */}
          {activeTab === "devices" && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDeviceAssignDialog}
                >
                  Assign Device
                </Button>
              </Box>
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
                      <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
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
                            color={device.status === "Activated" ? "success" :
                                   device.status === "Assigned" ? "info" : "warning"}
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
            </>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenBillingDialog}
                >
                  ADD BILLING
                </Button>
              </Box>

              {selectedTenant.billingDetails && selectedTenant.billingDetails.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeaderCellStyle}>Billing ID</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Payment Type</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Next Billing Month</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Contract Start</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Contract End</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Number of Devices</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Description</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTenant.billingDetails.map((billing, index) => (
                        <TableRow key={index}>
                          <TableCell sx={tableBodyCellStyle}>{billing.billingId}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{billing.paymentType}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{calculateNextBillingMonth(billing)}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{billing.startDate}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{billing.endDate || 'N/A'}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <Tooltip title={
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
                            }>
                              <span style={{ cursor: 'pointer', color: 'blue' }}>
                                View ({billing.deviceContract?.length || 0})
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            {billing.description || '—'}
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditBilling(billing)}
                              aria-label="edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBilling(billing.billingId || '')}
                              aria-label="delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography align="center">No billing details found</Typography>
              )}
            </>
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

      {/* Device Assignment Dialog */}
      <Dialog
        open={openDeviceAssignDialog}
        onClose={handleCloseDeviceAssignDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assign Devices to {selectedTenant?.name}
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedUnassignedDevices.length > 0 &&
                        selectedUnassignedDevices.length < unassignedDevices.length
                      }
                      checked={
                        unassignedDevices.length > 0 &&
                        selectedUnassignedDevices.length === unassignedDevices.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUnassignedDevices(unassignedDevices.map(d => d.id));
                        } else {
                          setSelectedUnassignedDevices([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Device ID</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Serial No.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unassignedDevices.length > 0 ? (
                  unassignedDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUnassignedDevices.includes(device.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUnassignedDevices([...selectedUnassignedDevices, device.id]);
                            } else {
                              setSelectedUnassignedDevices(
                                selectedUnassignedDevices.filter(id => id !== device.id)
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{device.deviceId}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{device.serialNo}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <Chip
                          label={device.status}
                          color={device.status === "Activated" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={tableBodyCellStyle}>No unassigned devices found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeviceAssignDialog}>Cancel</Button>
          <Button
            onClick={handleAssignDevices}
            variant="contained"
            color="primary"
            disabled={selectedUnassignedDevices.length === 0}
          >
            Assign Selected Devices
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editableUser && selectedTenant?.users?.find(user => user.id === editableUser.id) 
            ? `Edit User: ${editableUser.name}` 
            : `Add User to ${selectedTenant?.name}`}
        </DialogTitle>
        <DialogContent dividers>
          {editableUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editableUser.name}
                  onChange={(e) => setEditableUser({
                    ...editableUser,
                    name: e.target.value
                  })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editableUser.email}
                  onChange={(e) => setEditableUser({
                    ...editableUser,
                    email: e.target.value
                  })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={editableUser.roles}
                    label="Roles"
                    onChange={(e) => {
                      const newRoles = e.target.value as ("Owner" | "Engineer" | "Member")[];
                      const hadOwner = editableUser.roles.includes("Owner");
                      const hasOwner = newRoles.includes("Owner");
                      
                      setEditableUser({
                        ...editableUser,
                        roles: newRoles
                      });
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="Owner">Owner</MenuItem>
                    <MenuItem value="Engineer">Engineer</MenuItem>
                    <MenuItem value="Member">Member</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editableUser.mfaEnabled}
                      onChange={(e) => setEditableUser({
                        ...editableUser,
                        mfaEnabled: e.target.checked
                      })}
                    />
                  }
                  label="Enable MFA"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            color="primary"
            disabled={!editableUser || !editableUser.name || !editableUser.email}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog
        open={openBillingDialog}
        onClose={handleCloseBillingDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editableBilling && selectedTenant?.billingDetails?.find(billing => billing.billingId === editableBilling.billingId) 
            ? `Edit Billing: ${editableBilling.billingId}` 
            : `Add Billing to ${selectedTenant?.name}`}
        </DialogTitle>
        <DialogContent>
          {editableBilling && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Billing ID"
                  value={editableBilling.billingId || ''}
                  onChange={(e) => setEditableBilling({
                    ...editableBilling,
                    billingId: e.target.value
                  })}
                  fullWidth
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    value={editableBilling.paymentType || "Monthly"}
                    onChange={(e) => setEditableBilling({
                      ...editableBilling,
                      paymentType: e.target.value as "One-time" | "Monthly" | "Annually"
                    })}
                    label="Payment Type"
                  >
                    <MenuItem value="One-time">One-time</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Annually">Annually</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contract Start"
                  type="date"
                  value={editableBilling.startDate || ''}
                  onChange={(e) => setEditableBilling({
                    ...editableBilling,
                    startDate: e.target.value
                  })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contract End"
                  type="date"
                  value={editableBilling.endDate || ''}
                  onChange={(e) => setEditableBilling({
                    ...editableBilling,
                    endDate: e.target.value
                  })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Device Contracts</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeaderCellStyle}>Device Type</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Quantity</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editableBilling.deviceContract?.map((contract, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={contract.type}
                                onChange={(e) => {
                                  const newContracts = [...(editableBilling.deviceContract || [])];
                                  newContracts[index].type = e.target.value;
                                  setEditableBilling({
                                    ...editableBilling,
                                    deviceContract: newContracts
                                  });
                                }}
                              >
                                {defaultDeviceTypes.map(type => (
                                  <MenuItem key={type.name} value={type.name}>
                                    {type.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={contract.quantity}
                              onChange={(e) => {
                                const newContracts = [...(editableBilling.deviceContract || [])];
                                newContracts[index].quantity = parseInt(e.target.value);
                                setEditableBilling({
                                  ...editableBilling,
                                  deviceContract: newContracts
                                });
                              }}
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const newContracts = [...(editableBilling.deviceContract || [])];
                                newContracts.splice(index, 1);
                                setEditableBilling({
                                  ...editableBilling,
                                  deviceContract: newContracts
                                });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Button
                            startIcon={<AddIcon />}
                            size="small"
                            onClick={() => {
                              const newContracts = [...(editableBilling.deviceContract || [])];
                              newContracts.push({ type: defaultDeviceTypes[0].name, quantity: 1 });
                              setEditableBilling({
                                ...editableBilling,
                                deviceContract: newContracts
                              });
                            }}
                          >
                            Add Device Contract
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editableBilling.description || ''}
                  onChange={(e) => setEditableBilling({
                    ...editableBilling,
                    description: e.target.value
                  })}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBillingDialog}>Cancel</Button>
          <Button
            onClick={handleSaveBilling}
            variant="contained"
            color="primary"
            disabled={!editableBilling}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
