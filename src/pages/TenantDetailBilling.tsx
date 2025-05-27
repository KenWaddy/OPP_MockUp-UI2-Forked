import React, { useMemo, useEffect, useState } from "react";
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress 
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../styles/common';
import { BillingService } from '../services/billing.service';
import { Billing, DeviceContractItem } from '../types/models';

const billingService = new BillingService();

interface TenantDetailBillingProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
}

export const TenantDetailBilling: React.FC<TenantDetailBillingProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  getSortDirectionIndicator
}) => {
  const [billingRecords, setBillingRecords] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openBillingDialog, setOpenBillingDialog] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [editableBilling, setEditableBilling] = useState<Billing | null>(null);
  const [deviceContract, setDeviceContract] = useState<DeviceContractItem[]>([]);
  const [newDeviceContract, setNewDeviceContract] = useState<DeviceContractItem>({ type: '', quantity: 0 });

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!tenantId) return;
      
      setLoading(true);
      try {
        const allBillingItems = await billingService.getAllBillingItems();
        const tenantBillingItems = allBillingItems.filter(item => 
          item.subscriptionId === tenantId
        );
        
        setBillingRecords(tenantBillingItems);
      } catch (error) {
        setError(`Error fetching billing data: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingData();
  }, [tenantId]);

  const sortedBilling = useMemo(() => {
    if (!sortConfig) return billingRecords;
    return [...billingRecords].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Billing] as string | number;
      const bValue = b[sortConfig.key as keyof Billing] as string | number;
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [billingRecords, sortConfig]);

  const handleOpenBillingDialog = (billing?: Billing) => {
    if (billing) {
      setSelectedBilling(billing);
      setEditableBilling({...billing});
      setDeviceContract([...billing.deviceContract]);
    } else {
      setSelectedBilling(null);
      setEditableBilling({
        id: '',
        subscriptionId: tenantId || '',
        deviceContract: [],
        paymentType: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        description: ''
      } as Billing);
      setDeviceContract([]);
    }
    setOpenBillingDialog(true);
  };

  const handleCloseBillingDialog = () => {
    setOpenBillingDialog(false);
  };

  const handleSaveBilling = async () => {
    if (editableBilling && tenantId) {
      try {
        setLoading(true);
        
        const updatedBilling = {
          ...editableBilling,
          deviceContract: deviceContract
        };
        
        if (selectedBilling) {
          await billingService.updateBilling(updatedBilling);
        } else {
          await billingService.addBilling(updatedBilling);
        }
        
        setOpenBillingDialog(false);
        
        const allBillingItems = await billingService.getAllBillingItems();
        const tenantBillingItems = allBillingItems.filter(item => 
          item.subscriptionId === tenantId
        );
        setBillingRecords(tenantBillingItems);
      } catch (err) {
        setError(`Error saving billing: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteBilling = async (billingId: string) => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      await billingService.deleteBilling(billingId);
      
      const allBillingItems = await billingService.getAllBillingItems();
      const tenantBillingItems = allBillingItems.filter(item => 
        item.subscriptionId === tenantId
      );
      setBillingRecords(tenantBillingItems);
    } catch (err) {
      setError(`Error deleting billing: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeviceContract = () => {
    if (newDeviceContract.type && newDeviceContract.quantity > 0) {
      setDeviceContract([...deviceContract, {...newDeviceContract}]);
      setNewDeviceContract({ type: '', quantity: 0 });
    }
  };

  const handleRemoveDeviceContract = (index: number) => {
    const updatedContract = [...deviceContract];
    updatedContract.splice(index, 1);
    setDeviceContract(updatedContract);
  };

  return (
    <Box mt={2}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenBillingDialog()}
          disabled={!tenantId}
          sx={{ fontWeight: 'bold' }}
        >
          Add Billing
        </Button>
      </Box>
      
      {loading && <CircularProgress size={24} sx={{ display: 'block', margin: '20px auto' }} />}
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {!loading && billingRecords.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 2 }}>
          No billing details found for this tenant.
        </Typography>
      )}
      
      {billingRecords.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('paymentType')}
                  style={{ cursor: 'pointer' }}
                >
                  Payment Type {getSortDirectionIndicator('paymentType')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('startDate')}
                  style={{ cursor: 'pointer' }}
                >
                  Start Date {getSortDirectionIndicator('startDate')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('endDate')}
                  style={{ cursor: 'pointer' }}
                >
                  End Date {getSortDirectionIndicator('endDate')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle}
                  onClick={() => requestSort('description')}
                  style={{ cursor: 'pointer' }}
                >
                  Description {getSortDirectionIndicator('description')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBilling.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell sx={tableBodyCellStyle}>{billing.paymentType}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.startDate || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.endDate || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.description || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenBillingDialog(billing)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteBilling(billing.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Billing Dialog */}
      <Dialog open={openBillingDialog} onClose={handleCloseBillingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBilling ? 'Edit Billing' : 'Add Billing'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={editableBilling?.paymentType || 'Monthly'}
                label="Payment Type"
                onChange={(e) => setEditableBilling(prev => prev ? 
                  {...prev, paymentType: e.target.value as "One-time" | "Monthly" | "Annually"} : null
                )}
              >
                <MenuItem value="One-time">One-time</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Annually">Annually</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Start Date"
              type="date"
              value={editableBilling?.startDate || ''}
              onChange={(e) => setEditableBilling(prev => prev ? {...prev, startDate: e.target.value} : null)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="End Date"
              type="date"
              value={editableBilling?.endDate || ''}
              onChange={(e) => setEditableBilling(prev => prev ? {...prev, endDate: e.target.value} : null)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={editableBilling?.description || ''}
              onChange={(e) => setEditableBilling(prev => prev ? {...prev, description: e.target.value} : null)}
            />
            
            {/* Device Contract Section */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Device Contract</Typography>
            
            {deviceContract.map((contract, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1, gap: 1 }}>
                <TextField
                  label="Type"
                  value={contract.type}
                  onChange={(e) => {
                    const updatedContract = [...deviceContract];
                    updatedContract[index].type = e.target.value;
                    setDeviceContract(updatedContract);
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={contract.quantity}
                  onChange={(e) => {
                    const updatedContract = [...deviceContract];
                    updatedContract[index].quantity = parseInt(e.target.value) || 0;
                    setDeviceContract(updatedContract);
                  }}
                  sx={{ width: '100px' }}
                />
                <IconButton onClick={() => handleRemoveDeviceContract(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
              <TextField
                label="Type"
                value={newDeviceContract.type}
                onChange={(e) => setNewDeviceContract({...newDeviceContract, type: e.target.value})}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={newDeviceContract.quantity || ''}
                onChange={(e) => setNewDeviceContract({...newDeviceContract, quantity: parseInt(e.target.value) || 0})}
                sx={{ width: '100px' }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddDeviceContract}
                disabled={!newDeviceContract.type || newDeviceContract.quantity <= 0}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBillingDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveBilling} 
            variant="contained" 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
