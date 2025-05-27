import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { tableHeaderCellStyle } from '../../commons/styles.js';
import { TenantType as Tenant } from '../../commons/models.js';
import { defaultDeviceTypes } from '../../mockAPI/FakerData/deviceTypes.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';

interface BillingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editableBilling: any | null;
  setEditableBilling: React.Dispatch<React.SetStateAction<any | null>>;
  selectedTenant: Tenant | null;
  tenantBillingDetails: any[];
}

export const BillingDialog: React.FC<BillingDialogProps> = ({
  open,
  onClose,
  onSave,
  editableBilling,
  setEditableBilling,
  selectedTenant,
  tenantBillingDetails
}) => {
  const title = editableBilling && tenantBillingDetails?.find((billing: {id: string}) => billing.id === editableBilling.id)
    ? `Edit Billing: ${editableBilling.id}`
    : `Add Billing to ${selectedTenant?.name}`;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <CommonDialogActions
          onClose={onClose}
          onSave={onSave}
          saveDisabled={!editableBilling}
        />
      }
    >
      {editableBilling && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Billing ID"
              value={editableBilling.id || ''}
              onChange={(e) => setEditableBilling({
                ...editableBilling,
                id: e.target.value
              })}
              fullWidth
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={editableBilling.paymentType || "Monthly"}
                onChange={(e) => setEditableBilling({
                  ...editableBilling,
                  paymentType: e.target.value as "One-time" | "Monthly" | "Annually"
                })}
                label="Payment Type"
              >
                <MenuItem value="One-time">One-time</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Annually">Annually</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Contract Start"
              type="date"
              value={editableBilling.startDate || ''}
              onChange={(e) => setEditableBilling({
                ...editableBilling,
                startDate: e.target.value
              })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Contract End"
              type="date"
              value={editableBilling.endDate || ''}
              onChange={(e) => setEditableBilling({
                ...editableBilling,
                endDate: e.target.value
              })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Device Contracts</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellStyle}>Device Type</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Quantity</TableCell>
                    <TableCell sx={tableHeaderCellStyle}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editableBilling.deviceContract?.map((contract: {type: string, quantity: number}, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={contract.type}
                            onChange={(e) => {
                              const newContracts = [...(editableBilling.deviceContract || [])];
                              newContracts[index].type = e.target.value;
                              setEditableBilling({
                                ...editableBilling,
                                deviceContract: newContracts
                              });
                            }}
                          >
                            {defaultDeviceTypes.map(type => (
                              <MenuItem key={type.name} value={type.name}>
                                {type.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={contract.quantity}
                          onChange={(e) => {
                            const newContracts = [...(editableBilling.deviceContract || [])];
                            newContracts[index].quantity = parseInt(e.target.value);
                            setEditableBilling({
                              ...editableBilling,
                              deviceContract: newContracts
                            });
                          }}
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const newContracts = [...(editableBilling.deviceContract || [])];
                            newContracts.splice(index, 1);
                            setEditableBilling({
                              ...editableBilling,
                              deviceContract: newContracts
                            });
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Button
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() => {
                          const newContracts = [...(editableBilling.deviceContract || [])];
                          newContracts.push({ type: defaultDeviceTypes[0].name, quantity: 1 });
                          setEditableBilling({
                            ...editableBilling,
                            deviceContract: newContracts
                          });
                        }}
                      >
                        Add Device Contract
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              value={editableBilling.description || ''}
              onChange={(e) => setEditableBilling({
                ...editableBilling,
                description: e.target.value
              })}
              fullWidth
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
