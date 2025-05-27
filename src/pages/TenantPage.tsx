import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  Tabs,
  Tab,
  Alert
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { paperStyle, primaryTypographyStyle } from '../commons/styles.js';
import { TenantType as Tenant, UserType as User, DeviceType2 as Device } from '../commons/models.js';
import { TenantService, UserService, DeviceService, SubscriptionService } from '../mockAPI/index.js';
import { exportToCsv } from '../commons/export.js';
import { Subscription } from '../commons/models.js';
import { getNextSubscriptionId } from '../mockAPI/FakerData/subscriptions.js';
import { TenantDialog } from '../components/dialogs/TenantDialog';
import { TenantDetailUsers } from './TenantDetailUsers';
import { TenantDetailDevices } from './TenantDetailDevices';
import { TenantDetailBilling } from './TenantDetailBilling';
import { ContactDialog } from '../components/dialogs/ContactDialog';
import { SubscriptionDialog } from '../components/dialogs/SubscriptionDialog';
import { TenantDetailInfo } from './TenantDetailInfo';
import { TenantList } from './TenantList';
import { useSorting } from '../hooks/useSorting';

// Create service instances

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Device assignment dialog state moved to TenantDetailDevices
  // User state moved to TenantDetailUsers
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [editableContact, setEditableContact] = useState<Tenant["contact"] | null>(null);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [editableSubscription, setEditableSubscription] = useState<Subscription | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [tenantDevices, setTenantDevices] = useState<Device[]>([]);
  const [tenantBillingDetails, setTenantBillingDetails] = useState<any[]>([]);
  
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
      await tenantService.deleteTenant(tenantId);

      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(null);
      }
      
    } catch (err) {
      setError(`Error deleting tenant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const { sortConfig, requestSort } = useSorting();

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



  const contractTypeOptions = ["Evergreen", "Fixed-term", "Trial"];
  const statusOptions = ["Active", "Inactive", "Pending", "Suspended"];
  
  // sortedUsers function moved to TenantDetailUsers
  
  // sortedDevices and paginatedDevices moved to TenantDetailDevices
  

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
            <TenantDetailBilling 
              tenantId={selectedTenant?.id}
              sortConfig={sortConfig}
              requestSort={requestSort}
              tenantBillingDetails={tenantBillingDetails}
              setTenantBillingDetails={setTenantBillingDetails}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
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

          {/* Use the enhanced TenantList component */}
          <TenantList 
            onEditTenant={handleOpenTenantDialog}
            onDeleteTenant={handleDeleteTenant}
            onTenantSelect={loadTenantById}
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

      {/* Device Assignment Dialog moved to TenantDetailDevices */}

      {/* User Dialog removed - now handled by TenantDetailUsers */}

      {/* Billing Dialog moved to TenantDetailBilling */}

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
