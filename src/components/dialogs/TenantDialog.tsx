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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editableTenant.contact.first_name}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        first_name: e.target.value
                      }
                    })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editableTenant.contact.last_name}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        last_name: e.target.value
                      }
                    })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editableTenant.contact.email}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        email: e.target.value
                      }
                    })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={editableTenant.contact.language}
                      label="Language"
                      onChange={(e) => setEditableTenant({
                        ...editableTenant,
                        contact: {
                          ...editableTenant.contact,
                          language: e.target.value as '日本語' | 'English'
                        }
                      })}
                    >
                      <MenuItem value="日本語">日本語</MenuItem>
                      <MenuItem value="English">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={editableTenant.contact.company}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        company: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={editableTenant.contact.department}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        department: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Office Phone"
                    value={editableTenant.contact.phone_office}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        phone_office: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Phone"
                    value={editableTenant.contact.phone_mobile}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        phone_mobile: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    value={editableTenant.contact.address1}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        address1: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    value={editableTenant.contact.address2}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        address2: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editableTenant.contact.city}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        city: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State/Prefecture"
                    value={editableTenant.contact.state_prefecture}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        state_prefecture: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={editableTenant.contact.country}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        country: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={editableTenant.contact.postal_code}
                    onChange={(e) => setEditableTenant({
                      ...editableTenant,
                      contact: {
                        ...editableTenant.contact,
                        postal_code: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
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
