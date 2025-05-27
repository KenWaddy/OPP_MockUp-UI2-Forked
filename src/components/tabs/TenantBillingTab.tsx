import React from "react";
import { 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Chip,
  CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from "../../commons/styles.js";
import { DeviceContractItem } from "../../commons/models.js";

interface BillingDetail {
  id: string;
  paymentType: string;
  billingDate: string;
  nextBillingDate: string;
  amount: number;
  status: string;
  deviceContract: DeviceContractItem[];
}

interface TenantBillingTabProps {
  sortedBillingDetails: BillingDetail[];
  loading?: boolean;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
  handleOpenBillingDialog: () => void;
  handleEditBilling: (billing: BillingDetail) => void;
  handleDeleteBilling: (billingId: string) => void;
}

export const TenantBillingTab: React.FC<TenantBillingTabProps> = ({
  sortedBillingDetails,
  loading = false,
  requestSort,
  getSortDirectionIndicator,
  handleOpenBillingDialog,
  handleEditBilling,
  handleDeleteBilling
}) => {
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        sortedBillingDetails && sortedBillingDetails.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
            <Table size="small">
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
                    onClick={() => requestSort('billingDate')}
                    style={{ cursor: 'pointer' }}
                  >
                    Billing Date {getSortDirectionIndicator('billingDate')}
                  </TableCell>
                  <TableCell 
                    sx={tableHeaderCellStyle} 
                    onClick={() => requestSort('nextBillingDate')}
                    style={{ cursor: 'pointer' }}
                  >
                    Next Billing {getSortDirectionIndicator('nextBillingDate')}
                  </TableCell>
                  <TableCell 
                    sx={tableHeaderCellStyle} 
                    onClick={() => requestSort('amount')}
                    style={{ cursor: 'pointer' }}
                  >
                    Amount {getSortDirectionIndicator('amount')}
                  </TableCell>
                  <TableCell 
                    sx={tableHeaderCellStyle} 
                    onClick={() => requestSort('status')}
                    style={{ cursor: 'pointer' }}
                  >
                    Status {getSortDirectionIndicator('status')}
                  </TableCell>
                  <TableCell 
                    sx={tableHeaderCellStyle} 
                    onClick={() => requestSort('deviceContract')}
                    style={{ cursor: 'pointer' }}
                  >
                    Device Contract {getSortDirectionIndicator('deviceContract')}
                  </TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedBillingDetails.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell sx={tableBodyCellStyle}>{billing.paymentType}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{billing.billingDate}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{billing.nextBillingDate}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>${billing.amount.toFixed(2)}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Chip
                        label={billing.status}
                        color={
                          billing.status === "Paid" ? "success" :
                          billing.status === "Pending" ? "warning" :
                          billing.status === "Overdue" ? "error" :
                          "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      {billing.deviceContract.map((contract, index) => (
                        <div key={index}>
                          {contract.type}: {contract.quantity}
                        </div>
                      ))}
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
                        onClick={() => handleDeleteBilling(billing.id)}
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
        ) : (
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            No billing details found
          </Paper>
        )
      )}
    </>
  );
};
