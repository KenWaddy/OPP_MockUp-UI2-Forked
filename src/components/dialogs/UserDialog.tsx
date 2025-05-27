import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  FormControlLabel,
  Switch
} from "@mui/material";
import { UserType as User, TenantType as Tenant } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editableUser: User | null;
  setEditableUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedTenant: Tenant | null;
  tenantUsers: User[];
}

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  onSave,
  editableUser,
  setEditableUser,
  selectedTenant,
  tenantUsers
}) => {
  const title = editableUser && tenantUsers?.find((user: {id: string}) => user.id === editableUser.id)
    ? `Edit User: ${editableUser.name}`
    : `Add User to ${selectedTenant?.name}`;

  const isFormValid = editableUser && editableUser.name && editableUser.email;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={title}
      contentProps={{ dividers: true }}
      actions={
        <CommonDialogActions
          onClose={onClose}
          onSave={onSave}
          saveDisabled={!isFormValid}
        />
      }
    >
      {editableUser && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={editableUser.name}
              onChange={(e) => setEditableUser({
                ...editableUser,
                name: e.target.value
              })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={editableUser.email}
              onChange={(e) => setEditableUser({
                ...editableUser,
                email: e.target.value
              })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={editableUser.roles}
                label="Roles"
                onChange={(e) => {
                  const newRoles = e.target.value as ("Owner" | "Engineer" | "Member")[];
                  const hadOwner = editableUser.roles.includes("Owner");
                  const hasOwner = newRoles.includes("Owner");

                  setEditableUser({
                    ...editableUser,
                    roles: newRoles
                  });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        color={
                          value === "Owner" ? "primary" :
                          value === "Engineer" ? "secondary" :
                          "default"
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Owner">Owner</MenuItem>
                <MenuItem value="Engineer">Engineer</MenuItem>
                <MenuItem value="Member">Member</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editableUser.mfaEnabled}
                  onChange={(e) => setEditableUser({
                    ...editableUser,
                    mfaEnabled: e.target.checked
                  })}
                />
              }
              label="Enable MFA"
            />
          </Grid>
        </Grid>
      )}
    </BaseDialog>
  );
};
