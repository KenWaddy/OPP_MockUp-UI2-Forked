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
import { TenantDetailUsers } from './TenantDetailUsers';
import { TenantDetailDevices } from './TenantDetailDevices';
import { BillingDialog } from '../components/dialogs/BillingDialog';
import { ContactDialog } from '../components/dialogs/ContactDialog';
import { SubscriptionDialog } from '../components/dialogs/SubscriptionDialog';
import { ContactForm } from '../components/forms/ContactForm';
import { TenantDetailInfo } from './TenantDetailInfo';

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
  // Device assignment dialog state moved to TenantDetailDevices
  // User state moved to TenantDetailUsers
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
  
  // Device pagination and loading state moved to TenantDetailDevices

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
  
  // handleDevicePageChange moved to TenantDetailDevices

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

  // Device assignment functions moved to TenantDetailDevices

  // User management functions moved to TenantDetailUsers

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
  
  // sortedUsers function moved to TenantDetailUsers
  
  // sortedDevices and paginatedDevices moved to TenantDetailDevices
  
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
          {activeTab === "info" && (
            <TenantDetailInfo 
              selectedTenant={selectedTenant}
              currentSubscription={currentSubscription}
              handleOpenTenantDialog={handleOpenTenantDialog}
              handleOpenContactDialog={handleOpenContactDialog}
              handleOpenSubscriptionDialog={handleOpenSubscriptionDialog}
            />
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <TenantDetailUsers 
              tenantId={selectedTenant?.id}
              sortConfig={sortConfig}
              requestSort={requestSort}
              getSortDirectionIndicator={getSortDirectionIndicator}
              tenantUsers={tenantUsers}
              setTenantUsers={setTenantUsers}
              selectedTenant={selectedTenant}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
          )}

          {/* Devices Tab */}
          {activeTab === "devices" && (
            <TenantDetailDevices 
              tenantId={selectedTenant?.id}
              sortConfig={sortConfig}
              requestSort={requestSort}
              getSortDirectionIndicator={getSortDirectionIndicator}
              tenantDevices={tenantDevices}
              setTenantDevices={setTenantDevices}
              selectedTenant={selectedTenant}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
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
                  sx={{ fontWeight: 'bold' }}
                >
                  ADD BILLING
                </Button>
              </Box>

              {tenantBillingDetails && tenantBillingDetails.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={tableHeaderCellStyle} 
                          onClick={() => requestSort('id')}
                          style={{ cursor: 'pointer' }}
                        >
                          Billing ID {getSortDirectionIndicator('id')}
                        </TableCell>
                        <TableCell 
                          sx={tableHeaderCellStyle} 
                          onClick={() => requestSort('paymentType')}
                          style={{ cursor: 'pointer' }}
                        >
                          Payment Type {getSortDirectionIndicator('paymentType')}
                        </TableCell>
                        <TableCell 
                          sx={tableHeaderCellStyle} 
                          onClick={() => requestSort('nextBillingMonth')}
                          style={{ cursor: 'pointer' }}
                        >
                          Next Billing Month {getSortDirectionIndicator('nextBillingMonth')}
                        </TableCell>
                        <TableCell 
                          sx={tableHeaderCellStyle} 
                          onClick={() => requestSort('startDate')}
                          style={{ cursor: 'pointer' }}
                        >
                          Contract Start {getSortDirectionIndicator('startDate')}
                        </TableCell>
                        <TableCell 
                          sx={tableHeaderCellStyle} 
                          onClick={() => requestSort('endDate')}
                          style={{ cursor: 'pointer' }}
                        >
                          Contract End {getSortDirectionIndicator('endDate')}
                        </TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Number of Devices</TableCell>
                        <TableCell 
                          sx={tableHeaderCellStyle} 
                          onClick={() => requestSort('description')}
                          style={{ cursor: 'pointer' }}
                        >
                          Description {getSortDirectionIndicator('description')}
                        </TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedBillingDetails.map((billing, index) => (
                        <TableRow key={index}>
                          <TableCell sx={tableBodyCellStyle}>{billing.id}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <Chip
                              label={billing.paymentType}
                              size="small"
                              color={
                                billing.paymentType === "Monthly" ? "info" :
                                billing.paymentType === "Annually" ? "success" :
                                billing.paymentType === "One-time" ? "warning" :
                                "default"
                              }
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>{calculateNextBillingMonth(billing)}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{billing.startDate}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>{billing.endDate || 'N/A'}</TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            {billing.deviceContract && billing.deviceContract.length > 0
                              ? billing.deviceContract.map((contract: {type: string, quantity: number}) => `${contract.type} (${contract.quantity})`).join(', ')
                              : 'No devices'}
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
                              onClick={() => handleDeleteBilling(billing.id || '')}
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

      {/* Device Assignment Dialog moved to TenantDetailDevices */}

      {/* User Dialog removed - now handled by TenantDetailUsers */}

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
