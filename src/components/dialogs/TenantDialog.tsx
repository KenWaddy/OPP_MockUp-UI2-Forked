import React from "react";
import {
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { TenantType, Subscription } from "../../commons/models.js";
import { dialogContentStyle } from "../../commons/styles.js";
import { ContactForm } from "../forms/ContactForm";

interface TenantDialogProps {
  open: boolean;
  onClose: () => void;
  editableTenant: TenantType | null;
  editableSubscription: Subscription | null;
  activeTab: string;
  onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
  onSave: () => void;
  setEditableTenant: React.Dispatch<React.SetStateAction<TenantType | null>>;
  setEditableSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>;
}

export const TenantDialog: React.FC<TenantDialogProps> = ({
  open,
  onClose,
  editableTenant,
  editableSubscription,
  activeTab,
  onTabChange,
  onSave,
  setEditableTenant,
  setEditableSubscription
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editableTenant ? (editableTenant.id ? `Edit Tenant: ${editableTenant.name}` : 'Add New Tenant') : 'Tenant'}
      </DialogTitle>
      <DialogContent dividers>
        {editableTenant && (
          <>
            <Tabs
              value={activeTab}
              onChange={onTabChange}
              aria-label="tenant dialog tabs"
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="info" label="Tenant Info" />
              <Tab value="contact" label="Contact Info" />
              <Tab value="subscription" label="Subscription Info" />
            </Tabs>

            {/* Tenant Info Tab */}
            {activeTab === "info" && editableTenant && (
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
                    required
                  />
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
                  <TextField
                    fullWidth
                    label="ID"
                    value={editableTenant.id}
                    disabled
                    margin="normal"
                  />
                </Grid>
              </Grid>
            )}

            {/* Contact Info Tab */}
            {activeTab === "contact" && editableTenant && editableTenant.contact && (
              <ContactForm
                contact={editableTenant.contact}
                onChange={(updatedContact) => setEditableTenant({
                  ...editableTenant,
                  contact: updatedContact
                })}
                requiredFields={['first_name', 'last_name', 'email']}
              />
            )}

            {/* Subscription Info Tab */}
            {activeTab === "subscription" && editableTenant && editableSubscription && (
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
                    onChange={(e) => {
                      if (editableSubscription) {
                        setEditableSubscription({
                          ...editableSubscription,
                          name: e.target.value
                        });
                      }
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={editableSubscription.description}
                    onChange={(e) => {
                      if (editableSubscription) {
                        setEditableSubscription({
                          ...editableSubscription,
                          description: e.target.value
                        });
                      }
                    }}
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
                      onChange={(e) => {
                        if (editableSubscription) {
                          setEditableSubscription({
                            ...editableSubscription,
                            type: e.target.value as 'Evergreen' | 'Termed'
                          });
                        }
                      }}
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
                      onChange={(e) => {
                        if (editableSubscription) {
                          setEditableSubscription({
                            ...editableSubscription,
                            status: e.target.value as 'Active' | 'Cancelled'
                          });
                        }
                      }}
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
                    onChange={(e) => {
                      if (editableSubscription) {
                        setEditableSubscription({
                          ...editableSubscription,
                          start_date: e.target.value
                        });
                      }
                    }}
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
                    onChange={(e) => {
                      if (editableSubscription) {
                        setEditableSubscription({
                          ...editableSubscription,
                          end_date: e.target.value
                        });
                      }
                    }}
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
                            onChange={(e) => {
                              if (editableSubscription) {
                                setEditableSubscription({
                                  ...editableSubscription,
                                  enabled_app_DMS: e.target.checked
                                });
                              }
                            }}
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
                            onChange={(e) => {
                              if (editableSubscription) {
                                setEditableSubscription({
                                  ...editableSubscription,
                                  enabled_app_eVMS: e.target.checked
                                });
                              }
                            }}
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
                            onChange={(e) => {
                              if (editableSubscription) {
                                setEditableSubscription({
                                  ...editableSubscription,
                                  enabled_app_CVR: e.target.checked
                                });
                              }
                            }}
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
                            onChange={(e) => {
                              if (editableSubscription) {
                                setEditableSubscription({
                                  ...editableSubscription,
                                  enabled_app_AIAMS: e.target.checked
                                });
                              }
                            }}
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
                            onChange={(e) => {
                              if (editableSubscription) {
                                setEditableSubscription({
                                  ...editableSubscription,
                                  config_SSH_terminal: e.target.checked
                                });
                              }
                            }}
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
                            onChange={(e) => {
                              if (editableSubscription) {
                                setEditableSubscription({
                                  ...editableSubscription,
                                  config_AIAPP_installer: e.target.checked
                                });
                              }
                            }}
                          />
                        }
                        label="AIAPP Installer"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={!editableTenant || !editableTenant.name || !editableTenant.contact?.first_name || 
                    !editableTenant.contact?.last_name || !editableTenant.contact?.email}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
