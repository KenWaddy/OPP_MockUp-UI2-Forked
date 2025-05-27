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
  TextField,
  IconButton,
  Paper
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../../commons/styles.js';
import { Attribute, DeviceWithTenant, UnregisteredDevice } from '../../commons/models.js';

interface AttributesDialogProps {
  open: boolean;
  onClose: () => void;
  device: DeviceWithTenant | UnregisteredDevice | null;
  editableAttributes: Attribute[];
  editMode: boolean;
  newAttribute: Attribute;
  onEditClick: () => void;
  onSaveClick: () => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onAttributeChange: (index: number, field: 'key' | 'value', value: string) => void;
  onNewAttributeChange: (field: 'key' | 'value', value: string) => void;
}

export const AttributesDialog: React.FC<AttributesDialogProps> = ({
  open,
  onClose,
  device,
  editableAttributes,
  editMode,
  newAttribute,
  onEditClick,
  onSaveClick,
  onAddAttribute,
  onRemoveAttribute,
  onAttributeChange,
  onNewAttributeChange
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Attributes for {device?.name}
      </DialogTitle>
      <DialogContent dividers>
        {editMode ? (
          <>
            <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Key</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Value</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editableAttributes.map((attr, index) => (
                    <TableRow key={index}>
                      <TableCell sx={tableBodyCellStyle}>
                        <TextField
                          fullWidth
                          size="small"
                          value={attr.key}
                          onChange={(e) => onAttributeChange(index, 'key', e.target.value)}
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <TextField
                          fullWidth
                          size="small"
                          value={attr.value}
                          onChange={(e) => onAttributeChange(index, 'value', e.target.value)}
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <IconButton 
                          size="small" 
                          onClick={() => onRemoveAttribute(index)}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={tableBodyCellStyle}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="New Key"
                        value={newAttribute.key}
                        onChange={(e) => onNewAttributeChange('key', e.target.value)}
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="New Value"
                        value={newAttribute.value}
                        onChange={(e) => onNewAttributeChange('value', e.target.value)}
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={onAddAttribute}
                        disabled={!newAttribute.key.trim()}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Key</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {device && device.attributes.map((attr, index) => (
                    <TableRow key={index}>
                      <TableCell sx={tableBodyCellStyle}>{attr.key}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{attr.value}</TableCell>
                    </TableRow>
                  ))}
                  {device && device.attributes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={tableBodyCellStyle}>No attributes found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onSaveClick} variant="contained" color="primary">Save</Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={onEditClick} variant="contained" color="primary">Edit</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
