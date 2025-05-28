import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Alert
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { TenantType as Tenant, UserType as User, DeviceType2 as Device } from '../commons/models';
import { TenantService, UserService, DeviceService, SubscriptionService } from '../mockAPI/index.js';
import { exportToCsv } from '../commons/export_CSV.js';
import { Subscription } from '../commons/models';
import { getNextSubscriptionId } from '../mockAPI/FakerData/subscriptions.js';
import { TenantList } from './TenantList';
import { TenantDetail } from './TenantDetail';

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();
const subscriptionService = new SubscriptionService();

export const TenantPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setSelectedTenant(tenant);
    } else {
      // Create a new tenant template
      const newTenant: Tenant = {
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
      };
      
      // Create a new subscription template
      const newSubscription: Subscription = {
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
      };
      
      setSelectedTenant(newTenant);
      setCurrentSubscription(newSubscription);
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
    </div>
  );
};
