import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Chip
} from "@mui/material";
import { tableHeaderCellStyle, tableBodyCellStyle } from '../../commons/styles.js';
import { UnregisteredDeviceType as UnregisteredDevice, TenantType as Tenant } from '../../commons/models.js';

interface DeviceAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedTenant: Tenant | null;
  unassignedDevices: UnregisteredDevice[];
  selectedUnassignedDevices: string[];
  setSelectedUnassignedDevices: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DeviceAssignmentDialog: React.FC<DeviceAssignmentDialogProps> = ({
  open,
  onClose,
  onSave,
  selectedTenant,
  unassignedDevices,
  selectedUnassignedDevices,
  setSelectedUnassignedDevices
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Assign Devices to {selectedTenant?.name}
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedUnassignedDevices.length > 0 &&
                      selectedUnassignedDevices.length < unassignedDevices.length
                    }
                    checked={
                      unassignedDevices.length > 0 &&
                      selectedUnassignedDevices.length === unassignedDevices.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUnassignedDevices(unassignedDevices.map(d => d.id));
                      } else {
                        setSelectedUnassignedDevices([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Name</TableCell>
                <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                <TableCell sx={tableHeaderCellStyle}>Device ID</TableCell>
                <TableCell sx={tableHeaderCellStyle}>Serial No.</TableCell>
                <TableCell sx={tableHeaderCellStyle}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unassignedDevices.length > 0 ? (
                unassignedDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUnassignedDevices.includes(device.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUnassignedDevices([...selectedUnassignedDevices, device.id]);
                          } else {
                            setSelectedUnassignedDevices(
                              selectedUnassignedDevices.filter(id => id !== device.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.id}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.serialNo}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Chip
                        label={device.status}
                        color={device.status === "Activated" ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={tableBodyCellStyle}>No unassigned devices found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={selectedUnassignedDevices.length === 0}
        >
          Assign Selected Devices
        </Button>
      </DialogActions>
    </Dialog>
  );
};
