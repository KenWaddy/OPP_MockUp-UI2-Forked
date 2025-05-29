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
  CircularProgress,
  Chip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../commons/styles.js';
import { SortableTableCell } from '../components/tables/SortableTableCell';
import { BillingService } from '../mockAPI/billing.service.js';
import { Billing, DeviceContractItem } from '../commons/models.js';
import { BillingDialog } from '../components/dialogs/BillingDialog';
import { calculateNextBillingDate } from '../commons/billing_calc.js';
import { defaultDeviceTypes } from '../mockAPI/FakerData/deviceTypes.js';
import { useTranslation } from "react-i18next";
import { faker } from '@faker-js/faker';

const billingService = new BillingService();
const billingTypeOptions = ["Monthly", "Annually", "One-time"];

interface TenantDetailBillingProps {
  tenantId?: string;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
  requestSort: (key: string) => void;
  tenantBillingDetails?: any[];
  setTenantBillingDetails?: React.Dispatch<React.SetStateAction<any[]>>;
  loading?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  error?: string | null;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TenantDetailBilling: React.FC<TenantDetailBillingProps> = ({ 
  tenantId,
  sortConfig,
  requestSort,
  tenantBillingDetails = [],
  setTenantBillingDetails,
  loading: propLoading,
  setLoading: propSetLoading,
  error: propError,
  setError: propSetError
}) => {
  const { t } = useTranslation();
  const [localBillingRecords, setLocalBillingRecords] = useState<Billing[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const billingRecords = tenantBillingDetails || localBillingRecords;
  const loading = propLoading !== undefined ? propLoading : localLoading;
  const error = propError !== undefined ? propError : localError;
  
  const updateBillingRecords = (records: any[]) => {
    if (setTenantBillingDetails) {
      setTenantBillingDetails(records);
    } else {
      setLocalBillingRecords(records);
    }
  };
  
  const updateLoading = (isLoading: boolean) => {
    if (propSetLoading) {
      propSetLoading(isLoading);
    } else {
      setLocalLoading(isLoading);
    }
  };
  
  const updateError = (errorMsg: string | null) => {
    if (propSetError) {
      propSetError(errorMsg);
    } else {
      setLocalError(errorMsg);
    }
  };
  
  const [openBillingDialog, setOpenBillingDialog] = useState(false);
  const [editableBilling, setEditableBilling] = useState<any | null>(null);

  useEffect(() => {
    if (!tenantId || setTenantBillingDetails) return;
    
    const fetchBillingData = async () => {
      updateLoading(true);
      try {
        const allBillingItems = await billingService.getAllBillingItems();
        const tenantBillingItems = allBillingItems.filter(item => 
          item.subscriptionId === tenantId
        );
        
        updateBillingRecords(tenantBillingItems);
      } catch (error) {
        updateError(`Error fetching billing data: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        updateLoading(false);
      }
    };
    
    fetchBillingData();
  }, [tenantId, setTenantBillingDetails]);

  const handleOpenBillingDialog = () => {
    if (!tenantId) return;

    setEditableBilling({
      id: faker.string.uuid(),
      billingManageNo: `AMOR-${String(billingRecords.length + 1).padStart(3, '0')}`,
      paymentType: "Monthly",
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      deviceContract: [{ type: defaultDeviceTypes[0].name, quantity: 1 }],
      description: ''
    });

    setOpenBillingDialog(true);
  };

  const handleCloseBillingDialog = () => {
    setOpenBillingDialog(false);
  };

  const handleSaveBilling = async () => {
    if (!tenantId || !editableBilling) return;

    try {
      updateLoading(true);

      const billingWithTenant = {
        ...editableBilling,
        subscriptionId: tenantId
      };

      const existingBillingIndex = billingRecords.findIndex(billing => billing.id === editableBilling.id);

      if (existingBillingIndex >= 0) {
        const response = await billingService.updateBilling(billingWithTenant);
        
        if (response.success) {
          const updatedBillingDetails = [...billingRecords];
          updatedBillingDetails[existingBillingIndex] = response.data;
          updateBillingRecords(updatedBillingDetails);
        } else {
          updateError(`Failed to update billing: ${response.message}`);
        }
      } else {
        const response = await billingService.addBilling(billingWithTenant);
        
        if (response.success) {
          const updatedBillingDetails = [
            ...billingRecords,
            response.data
          ];
          updateBillingRecords(updatedBillingDetails);
        } else {
          updateError(`Failed to add billing: ${response.message}`);
        }
      }

      setOpenBillingDialog(false);
    } catch (err) {
      updateError(`Error saving billing: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      updateLoading(false);
    }
  };

  const handleEditBilling = (billing: any) => {
    if (!tenantId) return;

    setEditableBilling({
      ...billing
    });

    setOpenBillingDialog(true);
  };

  const handleDeleteBilling = async (billingId: string) => {
    if (!tenantId) return;

    try {
      updateLoading(true);
      
      const response = await billingService.deleteBilling(billingId);
      
      if (response.success) {
        const updatedBillingDetails = billingRecords.filter(billing => billing.id !== billingId);
        updateBillingRecords(updatedBillingDetails);
      } else {
        updateError(`Failed to delete billing: ${response.message}`);
      }
    } catch (err) {
      updateError(`Error deleting billing: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      updateLoading(false);
    }
  };

  const sortedBillingDetails = useMemo(() => {
    if (!billingRecords || !sortConfig) return billingRecords || [];
    return [...billingRecords].sort((a, b) => {
      if (sortConfig.key === 'nextBillingDate') {
        const nextBillingDateA = calculateNextBillingDate(a);
        const nextBillingDateB = calculateNextBillingDate(b);
        
        if (nextBillingDateA === '—' && nextBillingDateB !== '—') {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        if (nextBillingDateA !== '—' && nextBillingDateB === '—') {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        
        if (nextBillingDateA !== '—' && 
            nextBillingDateB !== '—') {
          if (nextBillingDateA < nextBillingDateB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (nextBillingDateA > nextBillingDateB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        
        if (nextBillingDateA < nextBillingDateB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (nextBillingDateA > nextBillingDateB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }
      
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [billingRecords, sortConfig]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenBillingDialog}
          sx={{ fontWeight: 'bold' }}
        >
          ADD BILLING
        </Button>
      </Box>

      {loading && <CircularProgress size={24} sx={{ display: 'block', margin: '20px auto' }} />}
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && billingRecords.length === 0 && (
        <Typography align="center">No billing details found</Typography>
      )}

      {billingRecords.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <SortableTableCell 
                  sortKey="id"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('billing.billingId')}
                </SortableTableCell>
                <SortableTableCell 
                  sortKey="billingManageNo"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('billing.billingManageNo')}
                </SortableTableCell>
                <SortableTableCell 
                  sortKey="paymentType"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('billing.paymentType')}
                </SortableTableCell>
                <SortableTableCell 
                  sortKey="nextBillingDate"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('billing.nextBillingDate')}
                </SortableTableCell>
                <SortableTableCell 
                  sortKey="startDate"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('billing.contractStart')}
                </SortableTableCell>
                <SortableTableCell 
                  sortKey="endDate"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('billing.contractEnd')}
                </SortableTableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('billing.numberOfDevices')}</TableCell>
                <SortableTableCell 
                  sortKey="description"
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  sx={tableHeaderCellStyle}
                >
                  {t('common.description')}
                </SortableTableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBillingDetails.map((billing, index) => (
                <TableRow key={index}>
                  <TableCell sx={tableBodyCellStyle}>{billing.id}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.billingManageNo || '—'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <Chip
                      label={billing.paymentType}
                      size="small"
                      color={
                        billing.paymentType === "Monthly" ? "info" :
                        billing.paymentType === "Annually" ? "success" :
                        billing.paymentType === "One-time" ? "warning" :
                        "default"
                      }
                    />
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>{calculateNextBillingDate(billing)}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.startDate}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>{billing.endDate || 'N/A'}</TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    {billing.deviceContract && billing.deviceContract.length > 0
                      ? billing.deviceContract.map((contract: {type: string, quantity: number}) => `${contract.type} (${contract.quantity})`).join(', ')
                      : 'No devices'}
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    {billing.description || '—'}
                  </TableCell>
                  <TableCell sx={tableBodyCellStyle}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditBilling(billing)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteBilling(billing.id || '')}
                      aria-label="delete"
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
      <BillingDialog
        open={openBillingDialog}
        onClose={handleCloseBillingDialog}
        onSave={handleSaveBilling}
        editableBilling={editableBilling}
        setEditableBilling={setEditableBilling}
        selectedTenant={null}
        tenantBillingDetails={billingRecords}
      />
    </>
  );
};
