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
import { tableHeaderCellStyle, tableBodyCellStyle, paperStyle, tableContainerStyle, primaryTypographyStyle, secondaryTypographyStyle, formControlStyle, actionButtonStyle, dialogContentStyle, listItemStyle, groupTitleStyle } from '../commons/styles.js';
import { TenantType as Tenant, UserType as User, DeviceType2 as Device, Attribute, DeviceContractItem, UnregisteredDeviceType as UnregisteredDevice } from '../commons/models.js';
import { defaultDeviceTypes } from '../mockAPI/FakerData/deviceTypes.js';
import { TenantService, UserService, DeviceService, SubscriptionService } from '../mockAPI/index.js';
import { formatContactName } from '../mockAPI/utils.js';
import { exportToCsv } from '../commons/export.js';
import { Subscription } from '../commons/models.js';
import { getNextSubscriptionId } from '../mockAPI/FakerData/subscriptions.js';
import { TenantDialog } from '../components/dialogs/TenantDialog';
import { ContactForm } from '../components/forms/ContactForm';
import { 
  TenantInfoTab, 
  TenantUsersTab, 
  TenantDevicesTab, 
  TenantBillingTab 
} from "../components/tabs";

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();
const subscriptionService = new SubscriptionService();

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
  }, [tenantBillingDetails, sortConfig, calculateNextBillingMonth]);

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
          {activeTab === "info" && selectedTenant && (
            <TenantInfoTab
              selectedTenant={selectedTenant}
              currentSubscription={currentSubscription}
              handleOpenTenantDialog={handleOpenTenantDialog}
              handleOpenContactDialog={handleOpenContactDialog}
              handleOpenSubscriptionDialog={handleOpenSubscriptionDialog}
            />
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
                  sx={{ fontWeight: 'bold' }}
                >
                  Add User
                </Button>
              </Box>
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
                        onClick={() => requestSort('email')}
                        style={{ cursor: 'pointer' }}
                      >
                        Email {getSortDirectionIndicator('email')}
                      </TableCell>
                      <TableCell 
                        sx={tableHeaderCellStyle} 
                        onClick={() => requestSort('roles')}
                        style={{ cursor: 'pointer' }}
                      >
                        Roles {getSortDirectionIndicator('roles')}
                      </TableCell>
                      <TableCell 
                        sx={tableHeaderCellStyle} 
                        onClick={() => requestSort('ipWhitelist')}
                        style={{ cursor: 'pointer' }}
                      >
                        IP Whitelist {getSortDirectionIndicator('ipWhitelist')}
                      </TableCell>
                      <TableCell 
                        sx={tableHeaderCellStyle} 
                        onClick={() => requestSort('mfa')}
                        style={{ cursor: 'pointer' }}
                      >
                        MFA {getSortDirectionIndicator('mfa')}
                      </TableCell>
                      <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                <TableBody>
                  {sortedUsers && sortedUsers.length > 0 ? (
                    sortedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell sx={tableBodyCellStyle}>{user.name}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>{user.email}</TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.roles.map((role, index) => (
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
            </>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <TenantBillingTab
              sortedBillingDetails={sortedBillingDetails}
              requestSort={requestSort}
              getSortDirectionIndicator={getSortDirectionIndicator}
              handleOpenBillingDialog={handleOpenBillingDialog}
              handleEditBilling={handleEditBilling}
              handleDeleteBilling={handleDeleteBilling}
            />
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
            sx={{ backgroundColor: "white" }}
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
          <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
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
                    onClick={() => requestSort('contact')}
                    sx={tableHeaderCellStyle}
                  >
                    Contact {getSortDirectionIndicator('contact')}
                  </TableCell>
                  <TableCell
                    onClick={() => requestSort('email')}
                    sx={tableHeaderCellStyle}
                  >
                    Email {getSortDirectionIndicator('email')}
                  </TableCell>
                  <TableCell
                    onClick={() => requestSort('type')}
                    sx={tableHeaderCellStyle}
                  >
                    Type {getSortDirectionIndicator('type')}
                  </TableCell>
                  <TableCell
                    onClick={() => requestSort('status')}
                    sx={tableHeaderCellStyle}
                  >
                    Status {getSortDirectionIndicator('status')}
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
                      <TableCell sx={tableBodyCellStyle}>
                        {formatContactName(
                          tenant.contact.first_name,
                          tenant.contact.last_name,
                          tenant.contact.language
                        )}
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{tenant.contact.email}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{currentSubscription?.type || 'N/A'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <Chip
                          label={currentSubscription?.status || 'N/A'}
                          color={
                            currentSubscription?.status === "Active" ? "success" :
                            currentSubscription?.status === "Cancelled" ? "error" :
                            "default"
                          }
                          size="small"
                        />
                      </TableCell>
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
                    <TableCell colSpan={6} align="center" sx={tableBodyCellStyle}>No tenants match the filter criteria</TableCell>
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
                      <TableCell sx={tableBodyCellStyle}>{device.id}</TableCell>
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
          {editableUser && tenantUsers?.find((user: {id: string}) => user.id === editableUser.id)
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
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            color={
                              value === "Owner" ? "primary" :
                              value === "Engineer" ? "secondary" :
                              "default"
                            }
                          />
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
          {editableBilling && tenantBillingDetails?.find((billing: {id: string}) => billing.id === editableBilling.id)
            ? `Edit Billing: ${editableBilling.id}`
            : `Add Billing to ${selectedTenant?.name}`}
        </DialogTitle>
        <DialogContent>
          {editableBilling && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Billing ID"
                  value={editableBilling.id || ''}
                  onChange={(e) => setEditableBilling({
                    ...editableBilling,
                    id: e.target.value
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
                      {editableBilling.deviceContract?.map((contract: {type: string, quantity: number}, index: number) => (
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

      {/* Contact Dialog */}
      <Dialog
        open={openContactDialog}
        onClose={handleCloseContactDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Contact Information
        </DialogTitle>
        <DialogContent dividers>
          {editableContact && (
            <ContactForm
              contact={editableContact}
              onChange={(updatedContact) => setEditableContact(updatedContact)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>Cancel</Button>
          <Button
            onClick={handleSaveContact}
            variant="contained"
            color="primary"
            disabled={!editableContact}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog
        open={openSubscriptionDialog}
        onClose={handleCloseSubscriptionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Subscription
        </DialogTitle>
        <DialogContent dividers>
          {editableSubscription && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID"
                  value={editableSubscription.id}
                  disabled
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editableSubscription.name}
                  onChange={(e) => setEditableSubscription({
                    ...editableSubscription,
                    name: e.target.value
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editableSubscription.description}
                  onChange={(e) => setEditableSubscription({
                    ...editableSubscription,
                    description: e.target.value
                  })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editableSubscription.type}
                    label="Type"
                    onChange={(e) => setEditableSubscription({
                      ...editableSubscription,
                      type: e.target.value as 'Evergreen' | 'Termed'
                    })}
                  >
                    <MenuItem value="Evergreen">Evergreen</MenuItem>
                    <MenuItem value="Termed">Termed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editableSubscription.status}
                    label="Status"
                    onChange={(e) => setEditableSubscription({
                      ...editableSubscription,
                      status: e.target.value as 'Active' | 'Cancelled'
                    })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={editableSubscription.start_date}
                  onChange={(e) => setEditableSubscription({
                    ...editableSubscription,
                    start_date: e.target.value
                  })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={editableSubscription.end_date}
                  onChange={(e) => setEditableSubscription({
                    ...editableSubscription,
                    end_date: e.target.value
                  })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Enabled Applications
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={editableSubscription.enabled_app_DMS}
                          onChange={(e) => setEditableSubscription({
                            ...editableSubscription,
                            enabled_app_DMS: e.target.checked
                          })}
                        />
                      }
                      label="DMS"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={editableSubscription.enabled_app_eVMS}
                          onChange={(e) => setEditableSubscription({
                            ...editableSubscription,
                            enabled_app_eVMS: e.target.checked
                          })}
                        />
                      }
                      label="eVMS"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={editableSubscription.enabled_app_CVR}
                          onChange={(e) => setEditableSubscription({
                            ...editableSubscription,
                            enabled_app_CVR: e.target.checked
                          })}
                        />
                      }
                      label="CVR"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={editableSubscription.enabled_app_AIAMS}
                          onChange={(e) => setEditableSubscription({
                            ...editableSubscription,
                            enabled_app_AIAMS: e.target.checked
                          })}
                        />
                      }
                      label="AIAMS"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={editableSubscription.config_SSH_terminal}
                          onChange={(e) => setEditableSubscription({
                            ...editableSubscription,
                            config_SSH_terminal: e.target.checked
                          })}
                        />
                      }
                      label="SSH Terminal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={editableSubscription.config_AIAPP_installer}
                          onChange={(e) => setEditableSubscription({
                            ...editableSubscription,
                            config_AIAPP_installer: e.target.checked
                          })}
                        />
                      }
                      label="AIAPP Installer"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubscriptionDialog}>Cancel</Button>
          <Button
            onClick={handleSaveSubscription}
            variant="contained"
            color="primary"
            disabled={!editableSubscription}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
