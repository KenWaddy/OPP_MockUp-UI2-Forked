import React from "react";
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  Divider,
  FormControlLabel,
  Checkbox,
  Chip
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { TenantType, Subscription } from "../../commons/models.js";
import { paperStyle, secondaryTypographyStyle, groupTitleStyle } from "../../commons/styles.js";

interface TenantInfoTabProps {
  selectedTenant: TenantType;
  currentSubscription: Subscription | null;
  handleOpenTenantDialog: (tenant: TenantType) => void;
  handleOpenContactDialog: () => void;
  handleOpenSubscriptionDialog: () => void;
}

export const TenantInfoTab: React.FC<TenantInfoTabProps> = ({
  selectedTenant,
  currentSubscription,
  handleOpenTenantDialog,
  handleOpenContactDialog,
  handleOpenSubscriptionDialog
}) => {
  return (
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
              onClick={handleOpenContactDialog}
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
              <Typography>{selectedTenant.contact.first_name} {selectedTenant.contact.last_name}</Typography>
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
              onClick={handleOpenSubscriptionDialog}
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
  );
};
