import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { TenantType as Tenant, UserType as User, DeviceType2 as Device } from '../commons/models';
import { TenantService, UserService, DeviceService, SubscriptionService } from '../mockAPI/index.js';
import { exportToCsv } from '../commons/export_CSV.js';
import { Subscription } from '../commons/models';
import { templates } from '../commons/templates';
import { TenantList } from './TenantList';
import { TenantDetail } from './TenantDetail';
import { TenantDialog } from '../components/dialogs/TenantDialog';
import { useTranslation } from "react-i18next";

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();
const subscriptionService = new SubscriptionService();

export const TenantPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [tenantDevices, setTenantDevices] = useState<Device[]>([]);
  const [tenantBillingDetails, setTenantBillingDetails] = useState<any[]>([]);
  
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [editableTenant, setEditableTenant] = useState<Tenant | null>(null);
  const [editableSubscription, setEditableSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  
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

  const handleOpenTenantDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditableTenant({...tenant});
    } else {
      // Create a new tenant template
      setEditableTenant(templates.createNewTenant());
      
      // Create a new subscription template
      setEditableSubscription(templates.createNewSubscription());
    }
    setActiveTab("info");
    setOpenTenantDialog(true);
  };

  const handleCloseTenantDialog = () => {
    setOpenTenantDialog(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleSaveTenant = async () => {
    if (editableTenant) {
      try {
        setLoading(true);
        
        if (editableTenant.id.startsWith('t-new-')) {
          const newSubscription = templates.createStandardSubscription();
          
          await tenantService.addTenant(editableTenant, newSubscription);
        } else {
          await tenantService.updateTenant(editableTenant);
        }

        setOpenTenantDialog(false);
      } catch (err) {
        setError(`Error saving tenant: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedTenant(null);
  };

  return (
    <div className="tenant-list">
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}

      {selectedTenant ? (
        <TenantDetail
          selectedTenant={selectedTenant}
          currentSubscription={currentSubscription}
          tenantUsers={tenantUsers}
          tenantDevices={tenantDevices}
          tenantBillingDetails={tenantBillingDetails}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
          onBackToList={handleBackToList}
          setSelectedTenant={setSelectedTenant}
          setTenantUsers={setTenantUsers}
          setTenantDevices={setTenantDevices}
          setTenantBillingDetails={setTenantBillingDetails}
        />
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
              {t('tenant.addTenant')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportAllTenants}
              sx={{ fontWeight: 'bold' }}
            >
              {t('tenant.exportAllTenantList')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportAllUsers}
              sx={{ fontWeight: 'bold' }}
            >
              {t('tenant.exportAllUserList')}
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
    </div>
  );
};
