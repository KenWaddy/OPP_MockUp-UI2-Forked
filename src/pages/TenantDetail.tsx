import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Paper,
  Typography,
  Alert
} from "@mui/material";
import { TenantDetailInfo } from './TenantDetailInfo';
import { TenantDetailUsers } from './TenantDetailUsers';
import { TenantDetailDevices } from './TenantDetailDevices';
import { TenantDetailBilling } from './TenantDetailBilling';
import { useSorting } from '../hooks/useSorting';
import { TenantType as Tenant, Subscription } from '../commons/models';
import { ContactDialog } from '../components/dialogs/ContactDialog';
import { SubscriptionDialog } from '../components/dialogs/SubscriptionDialog';
import { TenantDialog } from '../components/dialogs/TenantDialog';
import { useTranslation } from 'react-i18next';

interface TenantDetailProps {
  selectedTenant: Tenant;
  currentSubscription: Subscription | null;
  tenantUsers: any[];
  tenantDevices: any[];
  tenantBillingDetails: any[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  onBackToList: () => void;
  setSelectedTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  setTenantUsers: React.Dispatch<React.SetStateAction<any[]>>;
  setTenantDevices: React.Dispatch<React.SetStateAction<any[]>>;
  setTenantBillingDetails: React.Dispatch<React.SetStateAction<any[]>>;
}

export const TenantDetail: React.FC<TenantDetailProps> = ({
  selectedTenant,
  currentSubscription,
  tenantUsers,
  tenantDevices,
  tenantBillingDetails,
  loading,
  setLoading,
  error,
  setError,
  onBackToList,
  setSelectedTenant,
  setTenantUsers,
  setTenantDevices,
  setTenantBillingDetails
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("info");
  const { sortConfig, requestSort } = useSorting();
  
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [editableTenant, setEditableTenant] = useState<Tenant | null>(null);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [editableContact, setEditableContact] = useState<Tenant["contact"] | null>(null);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [editableSubscription, setEditableSubscription] = useState<Subscription | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
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
      
      
      setOpenSubscriptionDialog(false);
    } catch (err) {
      setError(`Error saving subscription: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTenantDialog = (tenant: Tenant) => {
    setEditableTenant({...tenant});
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
        
        setSelectedTenant(editableTenant);
        
        setOpenTenantDialog(false);
      } catch (err) {
        setError(`Error saving tenant: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{selectedTenant.name}</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onBackToList}
          sx={{ ml: 2, fontWeight: 'bold' }}
        >
          {t('common.backToList')}
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="tenant detail tabs"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab value="info" label={t('tenant.tenantInfo')} sx={{ fontWeight: 'bold' }} />
        <Tab value="users" label={t('common.users')} sx={{ fontWeight: 'bold' }} />
        <Tab value="devices" label={t('common.devices')} sx={{ fontWeight: 'bold' }} />
        <Tab value="billing" label={t('common.billing')} sx={{ fontWeight: 'bold' }} />
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
    </Paper>
  );
};
