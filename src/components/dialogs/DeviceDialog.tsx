import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { DeviceWithTenant, UnregisteredDevice } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';

interface DeviceDialogProps {
  open: boolean;
  onClose: () => void;
  device: DeviceWithTenant | UnregisteredDevice | null;
  editableDevice: DeviceWithTenant | UnregisteredDevice | null;
  deviceTypes: string[];
  onSave: () => void;
  onDeviceChange: (updatedDevice: DeviceWithTenant | UnregisteredDevice) => void;
}

export const DeviceDialog: React.FC<DeviceDialogProps> = ({
  open,
  onClose,
  device,
  editableDevice,
  deviceTypes,
  onSave,
  onDeviceChange
}) => {
  const title = device ? `Edit Device: ${device.name}` : 'Add New Device';
  const isFormValid = editableDevice && editableDevice.name && editableDevice.id;

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
      {editableDevice && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Device Name"
              value={editableDevice.name}
              onChange={(e) => onDeviceChange({
                ...editableDevice,
                name: e.target.value
              })}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={editableDevice.type}
                label="Type"
                onChange={(e) => onDeviceChange({
                  ...editableDevice,
                  type: e.target.value as string
                })}
              >
                {deviceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Device ID"
              value={editableDevice.id}
              onChange={(e) => onDeviceChange({
                ...editableDevice,
                id: e.target.value
              })}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Serial No."
              value={editableDevice.serialNo}
              onChange={(e) => onDeviceChange({
                ...editableDevice,
                serialNo: e.target.value
              })}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={editableDevice.description}
              onChange={(e) => onDeviceChange({
                ...editableDevice,
                description: e.target.value
              })}
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      )}
    </BaseDialog>
  );
};
