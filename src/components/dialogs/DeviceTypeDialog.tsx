import React from "react";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Paper
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../../commons/styles.js';
import { DeviceType } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';

interface DeviceTypeDialogProps {
  open: boolean;
  onClose: () => void;
  deviceTypes: DeviceType[];
  newDeviceType: DeviceType;
  onAddDeviceType: () => void;
  onRemoveDeviceType: (index: number) => void;
  onDeviceTypeChange: (index: number, field: keyof DeviceType, value: string) => void;
  onNewDeviceTypeChange: (field: keyof DeviceType, value: string) => void;
}

export const DeviceTypeDialog: React.FC<DeviceTypeDialogProps> = ({
  open,
  onClose,
  deviceTypes,
  newDeviceType,
  onAddDeviceType,
  onRemoveDeviceType,
  onDeviceTypeChange,
  onNewDeviceTypeChange
}) => {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Device Type Management"
      contentProps={{ dividers: true }}
      actions={<Button onClick={onClose}>Close</Button>}
    >
      <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderCellStyle}>Type Name</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Option</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Description</TableCell>
              <TableCell sx={tableHeaderCellStyle}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Add new device type row */}
            <TableRow>
              <TableCell sx={tableBodyCellStyle}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="New Type Name"
                  value={newDeviceType.name}
                  onChange={(e) => onNewDeviceTypeChange('name', e.target.value)}
                />
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Option"
                  value={newDeviceType.option}
                  onChange={(e) => onNewDeviceTypeChange('option', e.target.value)}
                />
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Description"
                  value={newDeviceType.description}
                  onChange={(e) => onNewDeviceTypeChange('description', e.target.value)}
                />
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={onAddDeviceType}
                  disabled={!newDeviceType.name.trim()}
                >
                  Add
                </Button>
              </TableCell>
            </TableRow>
            
            {/* Existing device types */}
            {deviceTypes.map((type, index) => (
              <TableRow key={index}>
                <TableCell sx={tableBodyCellStyle}>{type.name}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{type.option}</TableCell>
                <TableCell sx={tableBodyCellStyle}>{type.description}</TableCell>
                <TableCell sx={tableBodyCellStyle}>
                  <IconButton 
                    size="small" 
                    onClick={() => onRemoveDeviceType(index)}
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {deviceTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>No device types found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </BaseDialog>
  );
};
