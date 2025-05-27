import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { Subscription } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editableSubscription: Subscription | null;
  setEditableSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>;
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  open,
  onClose,
  onSave,
  editableSubscription,
  setEditableSubscription
}) => {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Edit Subscription"
      contentProps={{ dividers: true }}
      actions={
        <CommonDialogActions
          onClose={onClose}
          onSave={onSave}
          saveDisabled={!editableSubscription}
        />
      }
    >
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
    </BaseDialog>
  );
};
