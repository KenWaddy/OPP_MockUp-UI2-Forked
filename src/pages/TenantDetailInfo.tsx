import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
  IconButton
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { paperStyle, secondaryTypographyStyle, groupTitleStyle } from '../commons/styles';
import { formatContactName } from '../mockAPI/utils';
import { TenantType as Tenant, Subscription } from '../commons/models';
import { useTranslation } from 'react-i18next';

interface TenantDetailInfoProps {
  tenantId?: string;
  selectedTenant?: Tenant;
  currentSubscription?: Subscription | null;
  handleOpenTenantDialog?: (tenant: Tenant) => void;
  handleOpenContactDialog?: () => void;
  handleOpenSubscriptionDialog?: () => void;
}

export const TenantDetailInfo: React.FC<TenantDetailInfoProps> = ({ 
  tenantId,
  selectedTenant, 
  currentSubscription, 
  handleOpenTenantDialog, 
  handleOpenContactDialog, 
  handleOpenSubscriptionDialog 
}) => {
  const { t } = useTranslation();
  const tenant = selectedTenant || {
    id: 'N/A',
    name: 'N/A',
    description: 'N/A',
    contact: {
      first_name: 'N/A',
      last_name: 'N/A',
      language: 'en',
      company: 'N/A',
      department: 'N/A',
      email: 'N/A',
      phone_office: 'N/A',
      phone_mobile: 'N/A',
      address1: 'N/A',
      address2: '',
      city: 'N/A',
      state_prefecture: 'N/A',
      country: 'N/A',
      postal_code: 'N/A'
    }
  };
  
  const handleTenantDialog = handleOpenTenantDialog || ((_: any) => {});
  const handleContactDialog = handleOpenContactDialog || (() => {});
  const handleSubscriptionDialog = handleOpenSubscriptionDialog || (() => {});
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={paperStyle} variant="outlined">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ ...groupTitleStyle, fontWeight: "bold", fontSize: "1rem", flexGrow: 1 }}>{t('common.tenant')}</Typography>
            <IconButton
              size="small"
              onClick={() => handleTenantDialog(tenant as Tenant)}
              aria-label="edit tenant"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.id')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.id}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.name')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.name}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.description')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.description}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={paperStyle} variant="outlined">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ ...groupTitleStyle, fontWeight: "bold", fontSize: "1rem", flexGrow: 1 }}>{t('tenant.contact')}</Typography>
            <IconButton
              size="small"
              onClick={() => handleContactDialog()}
              aria-label="edit contact"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.name')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>
                {formatContactName(
                  tenant.contact.first_name,
                  tenant.contact.last_name,
                  tenant.contact.language as "日本語" | "English"
                )}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.company')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.company || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.department')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.department}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.email')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.email}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.officePhone')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.phone_office || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.mobilePhone')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.phone_mobile || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.company')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.company || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.address1')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>
                {tenant.contact.address1}
                {tenant.contact.address2 && <>, {tenant.contact.address2}</>}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.city')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.city || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.statePrefecture')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.state_prefecture || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.country')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.country || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('contact.postalCode')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.postal_code || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.language')}:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{tenant.contact.language || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={paperStyle} variant="outlined">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ ...groupTitleStyle, fontWeight: "bold", fontSize: "1rem", flexGrow: 1 }}>{t('common.subscription')}</Typography>
            <IconButton
              size="small"
              onClick={() => handleSubscriptionDialog()}
              aria-label="edit subscription"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.name')}:</Typography>
              <Typography>{currentSubscription?.name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.id')}:</Typography>
              <Typography>{currentSubscription?.id || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.description')}:</Typography>
              <Typography>{currentSubscription?.description || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.status')}:</Typography>
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
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('common.type')}:</Typography>
              <Typography>{currentSubscription?.type || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('subscription.startDate')}:</Typography>
              <Typography>{currentSubscription?.start_date || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography sx={{ ...secondaryTypographyStyle, fontWeight: "bold" }}>{t('subscription.endDate')}:</Typography>
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
  );
};
