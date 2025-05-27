import React, { useState, useEffect, useMemo } from "react";
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
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, tableContainerStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle, groupTitleStyle } from '../commons/styles.js';
import { TenantType as Tenant, UserType as User, DeviceType2 as Device, Attribute, DeviceContractItem, UnregisteredDeviceType as UnregisteredDevice } from '../commons/models.js';
import { defaultDeviceTypes } from '../mockAPI/FakerData/deviceTypes.js';
import { TenantService, UserService, DeviceService, SubscriptionService } from '../mockAPI/index.js';
import { formatContactName } from '../mockAPI/utils.js';
import { exportToCsv } from '../commons/export.js';
import { calculateNextBillingMonth } from '../commons/billing.js';
import { Subscription } from '../commons/models.js';
import { getNextSubscriptionId } from '../mockAPI/FakerData/subscriptions.js';
import { TenantDialog } from '../components/dialogs/TenantDialog';
import { DeviceAssignmentDialog } from '../components/dialogs/DeviceAssignmentDialog';
import { UserDialog } from '../components/dialogs/UserDialog';
import { BillingDialog } from '../components/dialogs/BillingDialog';
import { ContactDialog } from '../components/dialogs/ContactDialog';
import { SubscriptionDialog } from '../components/dialogs/SubscriptionDialog';
import { ContactForm } from '../components/forms/ContactForm';
import { SortableTable, PaginatedTable, DataTable, TableColumn, SortConfig, PaginationConfig } from '../components/tables';
import { Billing, TenantType } from '../commons/models';

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();
const subscriptionService = new SubscriptionService();



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
  const [editableBilling, setEditableBilling] = useState<any | null>(null);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [editableContact, setEditableContact] = useState<Tenant["contact"] | null>(null);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [editableSubscription, setEditableSubscription] = useState<Subscription | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [tenantDevices, setTenantDevices] = useState<Device[]>([]);
  const [tenantBillingDetails, setTenantBillingDetails] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100, // Default to 100 rows
    total: 0,
    totalPages: 0
  });
  
  const [devicePagination, setDevicePagination] = useState({
    page: 1,
    limit: 500, // Default to 500 rows as requested
    total: 0,
    totalPages: 0
  });
  
  const [loadingDevices, setLoadingDevices] = useState(false);

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
      
      // Load tenant basic info
      const response = await tenantService.getTenantById(id, false, false, true);
      if (response.success && response.data) {
        setSelectedTenant(response.data);
        
        if ((response.data as any).billingDetails) {
          setTenantBillingDetails((response.data as any).billingDetails);
        }
        
        if (response.data.subscriptionId) {
          const subscriptionResponse = await subscriptionService.getSubscriptionById(response.data.subscriptionId);
          if (subscriptionResponse.success && subscriptionResponse.data) {
            setCurrentSubscription(subscriptionResponse.data);
          }
        }
        
        const usersResponse = await userService.getUsersForTenant(id, {
          page: 1,
          limit: 1000
        });
        setTenantUsers(usersResponse.data);
        
        const devicesResponse = await deviceService.getDevicesForTenant(id, {
          page: 1,
          limit: 1000
        });
        setTenantDevices(devicesResponse.data);
      }
    } catch (err) {
      setError(`Error loading tenant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const [filters, setFilters] = useState<{
    contractType: string;
    status: string;
    textSearch: string;
  }>({
    contractType: "",
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
      if (filters.status) serviceFilters.subscriptionStatus = filters.status;
      if (filters.textSearch) serviceFilters.textSearch = filters.textSearch;

      // Convert sort config to the format expected by the service
      const serviceSort = sortConfig ? {
        field: sortConfig.key === 'tenant' ? 'name' :
               sortConfig.key === 'owner' ? 'owner' :
               sortConfig.key === 'email' ? 'email' :
               sortConfig.key === 'subscription.status' ? 'status' :
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
  
  const handleDevicePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setDevicePagination({ ...devicePagination, page });
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
        contact: {
          first_name: '',
          last_name: '',
          department: '',
          language: 'English',
          email: '',
          phone_office: '',
          phone_mobile: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          state_prefecture: '',
          country: '',
          postal_code: ''
        },
        subscriptionId: ''
      });
      
      setCurrentSubscription({
        id: `sub-new-${Math.floor(Math.random() * 1000)}`,
        name: '',
        description: '',
        type: 'Evergreen',
        status: 'Active',
        start_date: '',
        end_date: '',
        enabled_app_DMS: false,
        enabled_app_eVMS: false,
        enabled_app_CVR: false,
        enabled_app_AIAMS: false,
        config_SSH_terminal: false,
        config_AIAPP_installer: false
      });
    }
    setActiveTab("info"); // Reset to first tab when opening dialog
    setOpenTenantDialog(true);
  };

  const handleCloseTenantDialog = () => {
    setOpenTenantDialog(false);
  };

  const handleSaveTenant = async () => {
    if (editableTenant) {
      try {
        setLoading(true);
        
        if (selectedTenant) {
          // Update existing tenant
          await tenantService.updateTenant(editableTenant);
        } else {
          // Add new tenant with a new subscription
          const newSubscription = {
            id: getNextSubscriptionId(),
            name: 'Standard Plan',
            description: 'Standard subscription plan',
            type: 'Evergreen',
            status: 'Active',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            enabled_app_DMS: true,
            enabled_app_eVMS: true,
            enabled_app_CVR: false,
            enabled_app_AIAMS: false,
            config_SSH_terminal: true,
            config_AIAPP_installer: false
          };
          
          await tenantService.addTenant(editableTenant, newSubscription);
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
        'contract', 'subscription.status'
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
        ...tenantDevices,
        ...devicesToAssign.map(({ isUnregistered, ...deviceData }) => ({
          ...deviceData,
          status: "Assigned" as const // Set status to Assigned when device is assigned to a tenant
        })) as Device[]
      ];

      // Update the devices state
      setTenantDevices(updatedDevices);

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
      const updatedDevices = tenantDevices.filter((device: Device) => device.id !== deviceId);

      // Update the devices state
      setTenantDevices(updatedDevices);

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
    const isFirstUser = tenantUsers.length === 0;

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

      const existingUserIndex = tenantUsers.findIndex((user: User) => user.id === editableUser.id);

      if (existingUserIndex >= 0) {
        // Update existing user
        const updatedUsers = [...tenantUsers];
        updatedUsers[existingUserIndex] = editableUser;

        // Update the users state
        setTenantUsers(updatedUsers);
      } else {
        // Add new user
        const updatedUsers = [
          ...tenantUsers,
          editableUser
        ];

        // Update the users state
        setTenantUsers(updatedUsers);
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

    const userToDelete = tenantUsers.find((user: User) => user.id === userId);

    if (userToDelete && userToDelete.roles.includes('Owner')) {
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, this would call a service method to delete the user
      // For now, we'll just update the local state
      const updatedUsers = tenantUsers.filter((user: User) => user.id !== userId);

      // Update the users state
      setTenantUsers(updatedUsers);
    } catch (err) {
      setError(`Error deleting user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBillingDialog = () => {
    if (!selectedTenant) return;

    setEditableBilling({
      id: `BID-${Math.floor(Math.random() * 1000)}`,
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

  const handleOpenContactDialog = () => {
    if (!selectedTenant) return;
    setEditableContact({...selectedTenant.contact});
    setOpenContactDialog(true);
  };

  const handleCloseContactDialog = () => {
    setOpenContactDialog(false);
  };

  const handleSaveContact = () => {
    if (!selectedTenant || !editableContact) return;

    try {
      setLoading(true);
      setSelectedTenant({
        ...selectedTenant,
        contact: editableContact
      });
      setOpenContactDialog(false);
    } catch (err) {
      setError(`Error saving contact: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubscriptionDialog = () => {
    if (!selectedTenant || !currentSubscription) return;
    setEditableSubscription({...currentSubscription});
    setOpenSubscriptionDialog(true);
  };

  const handleCloseSubscriptionDialog = () => {
    setOpenSubscriptionDialog(false);
  };

  const handleSaveSubscription = async () => {
    if (!selectedTenant || !editableSubscription) return;

    try {
      setLoading(true);
      
      // In a real implementation, this would call a service method to save the subscription
      // For now, we'll just update the local state
      setCurrentSubscription(editableSubscription);
      
      setOpenSubscriptionDialog(false);
    } catch (err) {
      setError(`Error saving subscription: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };


  const handleSaveBilling = () => {
    if (!selectedTenant || !editableBilling) return;

    try {
      setLoading(true);

      const existingBillingIndex = tenantBillingDetails.findIndex(billing => billing.id === editableBilling.id);

      if (existingBillingIndex >= 0) {
        // Update existing billing detail
        const updatedBillingDetails = [...tenantBillingDetails];
        updatedBillingDetails[existingBillingIndex] = editableBilling;

        // Update the billing details state
        setTenantBillingDetails(updatedBillingDetails);
      } else {
        // Add new billing detail
        const updatedBillingDetails = [
          ...tenantBillingDetails,
          editableBilling
        ];

        // Update the billing details state
        setTenantBillingDetails(updatedBillingDetails);
      }

      setOpenBillingDialog(false);
    } catch (err) {
      setError(`Error saving billing: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBilling = (billing: any) => {
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
      const updatedBillingDetails = tenantBillingDetails.filter(billing => billing.id !== billingId);

      // Update the billing details state
      setTenantBillingDetails(updatedBillingDetails);
    } catch (err) {
      setError(`Error deleting billing: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const contractTypeOptions = ["Evergreen", "Fixed-term", "Trial"];
  const billingTypeOptions = ["Monthly", "Annually", "One-time"];
  const statusOptions = ["Active", "Inactive", "Pending", "Suspended"];
  
  const sortedUsers = useMemo(() => {
    if (!tenantUsers || !sortConfig) return tenantUsers || [];
    return [...tenantUsers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [tenantUsers, sortConfig]);
  
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
    
    // Update pagination state with calculated values if they've changed
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
  
  const sortedBillingDetails = useMemo(() => {
    if (!tenantBillingDetails || !sortConfig) return tenantBillingDetails || [];
    return [...tenantBillingDetails].sort((a, b) => {
      if (sortConfig.key === 'nextBillingMonth') {
        const nextBillingMonthA = calculateNextBillingMonth(a);
        const nextBillingMonthB = calculateNextBillingMonth(b);
        
        if (nextBillingMonthA === 'Ended' && nextBillingMonthB !== 'Ended') {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        if (nextBillingMonthA !== 'Ended' && nextBillingMonthB === 'Ended') {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        
        if (nextBillingMonthA === '—' && nextBillingMonthB !== '—') {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        if (nextBillingMonthA !== '—' && nextBillingMonthB === '—') {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        
        if (nextBillingMonthA !== '—' && nextBillingMonthA !== 'Ended' && 
            nextBillingMonthB !== '—' && nextBillingMonthB !== 'Ended') {
          const [yearA, monthA] = nextBillingMonthA.split('-').map(Number);
          const [yearB, monthB] = nextBillingMonthB.split('-').map(Number);
          
          if (yearA !== yearB) {
            return (yearA - yearB) * (sortConfig.direction === 'ascending' ? 1 : -1);
          }
          return (monthA - monthB) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }
        
        if (nextBillingMonthA < nextBillingMonthB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (nextBillingMonthA > nextBillingMonthB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }
      
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
  }, [tenantBillingDetails, sortConfig]);

  return (
    <div className="tenant-list">

      {selectedTenant ? (
        <Paper sx={{ p: 2 }} variant="outlined">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{selectedTenant.name}</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedTenant(null)}
              sx={{ ml: 2, fontWeight: 'bold' }}
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
            <Tab value="info" label="Tenant Info" sx={{ fontWeight: 'bold' }} />
            <Tab value="users" label="Users" sx={{ fontWeight: 'bold' }} />
            <Tab value="devices" label="Devices" sx={{ fontWeight: 'bold' }} />
            <Tab value="billing" label="Billing" sx={{ fontWeight: 'bold' }} />
          </Tabs>

          {/* Tenant Info Tab */}
          {activeTab === "info" && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={paperStyle} variant="outlined">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ ...groupTitleStyle, fontWeight: "bold", fontSize: "1rem", flexGrow: 1 }}>Tenant</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenTenantDialog(selectedTenant)}
                      aria-label="edit tenant"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>ID:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.id}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Name:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.name}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Description:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.description}</Typography>
                    </Grid>

                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={paperStyle} variant="outlined">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ ...groupTitleStyle, fontWeight: "bold", fontSize: "1rem", flexGrow: 1 }}>Contact</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenContactDialog()}
                      aria-label="edit contact"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Name:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>
                        {formatContactName(
                          selectedTenant.contact.first_name,
                          selectedTenant.contact.last_name,
                          selectedTenant.contact.language
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Company:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.company || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Department:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.department}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Email:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.email}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Office Phone:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.phone_office || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Mobile Phone:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.phone_mobile || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Company:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.company || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Address:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>
                        {selectedTenant.contact.address1}
                        {selectedTenant.contact.address2 && <>, {selectedTenant.contact.address2}</>}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>City:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.city || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>State/Prefecture:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.state_prefecture || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Country:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.country || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Postal Code:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.postal_code || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Language:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{selectedTenant.contact.language || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={paperStyle} variant="outlined">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ ...groupTitleStyle, fontWeight: "bold", fontSize: "1rem", flexGrow: 1 }}>Subscription</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenSubscriptionDialog()}
                      aria-label="edit subscription"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Name:</Typography>
                      <Typography>{currentSubscription?.name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>ID:</Typography>
                      <Typography>{currentSubscription?.id || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Description:</Typography>
                      <Typography>{currentSubscription?.description || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Status:</Typography>
                      <Chip
                        label={currentSubscription?.status || 'N/A'}
                        color={
                          currentSubscription?.status === "Active" ? "success" :
                          currentSubscription?.status === "Cancelled" ? "error" :
                          "default"
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Type:</Typography>
                      <Typography>{currentSubscription?.type || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>Start Date:</Typography>
                      <Typography>{currentSubscription?.start_date || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>End Date:</Typography>
                      <Typography>{currentSubscription?.end_date || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold", mb: 1 }}>Enabled Applications:</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={currentSubscription?.enabled_app_DMS || false} 
                                disabled 
                              />
                            }
                            label="DMS"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={currentSubscription?.enabled_app_eVMS || false} 
                                disabled 
                              />
                            }
                            label="eVMS"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={currentSubscription?.enabled_app_CVR || false} 
                                disabled 
                              />
                            }
                            label="CVR"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={currentSubscription?.enabled_app_AIAMS || false} 
                                disabled 
                              />
                            }
                            label="AIAMS"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold", mb: 1 }}>Configuration:</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={currentSubscription?.config_SSH_terminal || false} 
                                disabled 
                              />
                            }
                            label="SSH Terminal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={currentSubscription?.config_AIAPP_installer || false} 
                                disabled 
                              />
                            }
                            label="AIAPP Installer"
                          />
                        </Grid>

                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <>
              <DataTable
                data={sortedUsers || []}
                columns={useMemo(() => {
                  const userColumns: TableColumn<User>[] = [
                    {
                      key: 'name',
                      label: 'Name',
                      sortable: true
                    },
                    {
                      key: 'email',
                      label: 'Email',
                      sortable: true
                    },
                    {
                      key: 'roles',
                      label: 'Roles',
                      sortable: true,
                      render: (roles, user) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(roles as string[]).map((role, index) => (
                            <Chip
                              key={index}
                              label={role}
                              size="small"
                              color={
                                role === "Owner" ? "primary" :
                                role === "Engineer" ? "secondary" :
                                "default"
                              }
                            />
                          ))}
                        </Box>
                      )
                    },
                    {
                      key: 'ipWhitelist',
                      label: 'IP Whitelist',
                      sortable: true,
                      render: (ipList, user) => (
                        (ipList as string[]).length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(ipList as string[]).map((ip, index) => (
                              <Chip key={index} label={ip} size="small" />
                            ))}
                          </Box>
                        ) : (
                          'None'
                        )
                      )
                    },
                    {
                      key: 'mfaEnabled',
                      label: 'MFA',
                      sortable: true,
                      render: (mfaEnabled) => (
                        <Chip
                          label={mfaEnabled ? 'Enabled' : 'Disabled'}
                          color={mfaEnabled ? 'success' : 'error'}
                          size="small"
                        />
                      )
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      sortable: false,
                      render: (_, user) => (
                        <>
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
                        </>
                      )
                    }
                  ];
                  return userColumns;
                }, [handleEditUser, handleDeleteUser])}
                sortConfig={sortConfig}
                requestSort={requestSort}
                getSortDirectionIndicator={getSortDirectionIndicator}
                pagination={{
                  page: 1,
                  limit: 100,
                  total: sortedUsers?.length || 0,
                  totalPages: 1
                }}
                onPageChange={() => {}} // No pagination needed for users
                showPagination={false}
                loading={loading}
                error={error}
                emptyMessage="No users found"
                actions={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenUserDialog}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Add User
                  </Button>
                }
              />
            </>
          )}

          {/* Devices Tab */}
          {activeTab === "devices" && (
            <>
              <DataTable
                data={paginatedDevices || []}
                columns={useMemo(() => {
                  const deviceColumns: TableColumn<Device>[] = [
                    {
                      key: 'name',
                      label: 'Name',
                      sortable: true
                    },
                    {
                      key: 'type',
                      label: 'Type',
                      sortable: true
                    },
                    {
                      key: 'id',
                      label: 'Device ID',
                      sortable: true
                    },
                    {
                      key: 'serialNo',
                      label: 'Serial No.',
                      sortable: true
                    },
                    {
                      key: 'description',
                      label: 'Description',
                      sortable: true
                    },
                    {
                      key: 'status',
                      label: 'Status',
                      sortable: true,
                      render: (status) => (
                        <Chip
                          label={status as string}
                          color={
                            status === "Activated" ? "success" :
                            status === "Assigned" ? "info" : "warning"
                          }
                          size="small"
                        />
                      )
                    },
                    {
                      key: 'attributes',
                      label: 'Attributes',
                      sortable: false,
                      render: (attributes) => (
                        <Tooltip 
                          leaveDelay={0}
                          title={
                            <List dense>
                              {(attributes as Attribute[]).map((attr, index) => (
                                <ListItem key={index}>
                                  <ListItemText primary={`${attr.key}: ${attr.value}`} />
                                </ListItem>
                              ))}
                            </List>
                          }
                        >
                          <span style={{ cursor: 'pointer', color: 'blue' }}>
                            View ({(attributes as Attribute[]).length})
                          </span>
                        </Tooltip>
                      )
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      sortable: false,
                      render: (_, device) => (
                        <IconButton
                          size="small"
                          onClick={() => handleUnassignDevice(device.id)}
                          aria-label="unassign"
                        >
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      )
                    }
                  ];
                  return deviceColumns;
                }, [handleUnassignDevice])}
                sortConfig={sortConfig}
                requestSort={requestSort}
                getSortDirectionIndicator={getSortDirectionIndicator}
                pagination={devicePagination}
                onPageChange={handleDevicePageChange}
                onLimitChange={(limit) => {
                  setDevicePagination({ ...devicePagination, page: 1, limit });
                }}
                rowsPerPageOptions={[100, 500, 2000]}
                loading={loadingDevices}
                error={error}
                emptyMessage="No devices found"
                actions={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDeviceAssignDialog}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Assign Device
                  </Button>
                }
              />
            </>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <>
              <DataTable
                data={sortedBillingDetails || []}
                columns={useMemo(() => {
                  const billingColumns: TableColumn<Billing>[] = [
                    {
                      key: 'id',
                      label: 'Billing ID',
                      sortable: true
                    },
                    {
                      key: 'paymentType',
                      label: 'Payment Type',
                      sortable: true,
                      render: (paymentType) => (
                        <Chip
                          label={paymentType as string}
                          size="small"
                          color={
                            paymentType === "Monthly" ? "info" :
                            paymentType === "Annually" ? "success" :
                            paymentType === "One-time" ? "warning" :
                            "default"
                          }
                        />
                      )
                    },
                    {
                      key: 'nextBillingMonth',
                      label: 'Next Billing Month',
                      sortable: true,
                      render: (_, billing) => calculateNextBillingMonth(billing)
                    },
                    {
                      key: 'startDate',
                      label: 'Contract Start',
                      sortable: true
                    },
                    {
                      key: 'endDate',
                      label: 'Contract End',
                      sortable: true,
                      render: (endDate) => endDate || 'N/A'
                    },
                    {
                      key: 'deviceContract',
                      label: 'Number of Devices',
                      sortable: false,
                      render: (deviceContract) => (
                        (deviceContract as {type: string, quantity: number}[] || []).length > 0
                          ? (deviceContract as {type: string, quantity: number}[]).map(contract => `${contract.type} (${contract.quantity})`).join(', ')
                          : 'No devices'
                      )
                    },
                    {
                      key: 'description',
                      label: 'Description',
                      sortable: true,
                      render: (description) => description || '—'
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      sortable: false,
                      render: (_, billing) => (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditBilling(billing)}
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteBilling(billing.id || '')}
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )
                    }
                  ];
                  return billingColumns;
                }, [calculateNextBillingMonth])}
                sortConfig={sortConfig}
                requestSort={requestSort}
                getSortDirectionIndicator={getSortDirectionIndicator}
                pagination={{
                  page: 1,
                  limit: 100,
                  total: sortedBillingDetails?.length || 0,
                  totalPages: 1
                }}
                onPageChange={() => {}} // No pagination needed for billing
                showPagination={false}
                loading={loading}
                error={error}
                emptyMessage="No billing details found"
                actions={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenBillingDialog}
                    sx={{ fontWeight: 'bold' }}
                  >
                    ADD BILLING
                  </Button>
                }
              />
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
              sx={{ fontWeight: 'bold' }}
            >
              Add Tenant
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportAllTenants}
              sx={{ fontWeight: 'bold' }}
            >
              Export All Tenant List
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportAllUsers}
              sx={{ fontWeight: 'bold' }}
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
              borderRadius: '4px',
              bgcolor: '#F2F2F2'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Filters
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setFilters({
                  contractType: "",
                  status: "",
                  textSearch: "",
                })}
                startIcon={<FilterListIcon />}
                sx={{ fontWeight: 'bold' }}
              >
                Reset Filters
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* Text input filter */}
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Text Search"
                  placeholder="Search by Tenant Name, Contact Name, or Email Address"
                  value={filters.textSearch}
                  onChange={(e) => setFilters({ ...filters, textSearch: e.target.value })}
                  sx={{ backgroundColor: "white" }}
                />
              </Grid>

          {/* Dropdown filters */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Subscription Type</InputLabel>
              <Select
                value={filters.contractType}
                label="Subscription Type"
                onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
                sx={{ backgroundColor: "white" }}
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
              <InputLabel>Subscription Status</InputLabel>
              <Select
                value={filters.status}
                label="Subscription Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                sx={{ backgroundColor: "white" }}
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
          </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}

      {/* Tenant Table with Pagination */}
      <PaginatedTable
        data={tenants}
        columns={useMemo(() => {
          const tenantColumns: TableColumn<TenantType>[] = [
            {
              key: 'name',
              label: 'Tenant',
              sortable: true,
              render: (name, tenant) => (
                <span
                  className="clickable"
                  onClick={() => loadTenantById(tenant.id)}
                  style={{ cursor: 'pointer', color: 'blue' }}
                >
                  {name as string}
                </span>
              )
            },
            {
              key: 'contact',
              label: 'Contact',
              sortable: true,
              render: (_, tenant) => (
                formatContactName(
                  tenant.contact.first_name,
                  tenant.contact.last_name,
                  tenant.contact.language
                )
              )
            },
            {
              key: 'email',
              label: 'Email',
              sortable: true,
              render: (_, tenant) => tenant.contact.email
            },
            {
              key: 'type',
              label: 'Type',
              sortable: true,
              render: () => currentSubscription?.type || 'N/A'
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: () => (
                <Chip
                  label={currentSubscription?.status || 'N/A'}
                  color={
                    currentSubscription?.status === "Active" ? "success" :
                    currentSubscription?.status === "Cancelled" ? "error" :
                    "default"
                  }
                  size="small"
                />
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              sortable: false,
              render: (_, tenant) => (
                <>
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
                </>
              )
            }
          ];
          return tenantColumns;
        }, [loadTenantById, handleOpenTenantDialog, handleDeleteTenant, currentSubscription])}
        sortConfig={sortConfig}
        requestSort={requestSort}
        getSortDirectionIndicator={getSortDirectionIndicator}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={(limit) => {
          setPagination({ ...pagination, page: 1, limit });
        }}
        rowsPerPageOptions={[20, 100, 500]}
        loading={loading}
        error={error}
        emptyMessage="No tenants match the filter criteria"
      />
      </>
      )}

      {/* Tenant Dialog */}
      <TenantDialog
        open={openTenantDialog}
        onClose={handleCloseTenantDialog}
        editableTenant={editableTenant}
        editableSubscription={editableSubscription}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSave={handleSaveTenant}
        setEditableTenant={setEditableTenant}
        setEditableSubscription={setEditableSubscription}
      />

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

      {/* User Dialog */}
      <UserDialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        onSave={handleSaveUser}
        editableUser={editableUser}
        setEditableUser={setEditableUser}
        selectedTenant={selectedTenant}
        tenantUsers={tenantUsers}
      />

      {/* Billing Dialog */}
      <BillingDialog
        open={openBillingDialog}
        onClose={handleCloseBillingDialog}
        onSave={handleSaveBilling}
        editableBilling={editableBilling}
        setEditableBilling={setEditableBilling}
        selectedTenant={selectedTenant}
        tenantBillingDetails={tenantBillingDetails}
      />

      {/* Contact Dialog */}
      <ContactDialog
        open={openContactDialog}
        onClose={handleCloseContactDialog}
        onSave={handleSaveContact}
        editableContact={editableContact}
        setEditableContact={setEditableContact}
      />

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={openSubscriptionDialog}
        onClose={handleCloseSubscriptionDialog}
        onSave={handleSaveSubscription}
        editableSubscription={editableSubscription}
        setEditableSubscription={setEditableSubscription}
      />
    </div>
  );
};
