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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from "../../commons/styles.js";
import { Device } from "../../commons/models.js";

interface TenantDevicesTabProps {
  paginatedDevices: Device[];
  devicePagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  loadingDevices?: boolean;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
  handleDevicePageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  handleOpenDeviceAssignDialog: () => void;
  handleUnassignDevice: (deviceId: string) => void;
  setDevicePagination: React.Dispatch<React.SetStateAction<{
    page: number;
    limit: number;
    totalPages: number;
  }>>;
}

export const TenantDevicesTab: React.FC<TenantDevicesTabProps> = ({
  paginatedDevices,
  devicePagination,
  loadingDevices = false,
  requestSort,
  getSortDirectionIndicator,
  handleDevicePageChange,
  handleOpenDeviceAssignDialog,
  handleUnassignDevice,
  setDevicePagination
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="device-rows-per-page-label">Rows</InputLabel>
            <Select
              labelId="device-rows-per-page-label"
              value={devicePagination.limit}
              label="Rows"
              onChange={(e) => {
                setDevicePagination({ ...devicePagination, page: 1, limit: Number(e.target.value) });
              }}
              sx={{ backgroundColor: "white" }}
            >
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={500}>500</MenuItem>
              <MenuItem value={2000}>2000</MenuItem>
            </Select>
          </FormControl>
          <Pagination 
            count={devicePagination.totalPages} 
            page={devicePagination.page} 
            onChange={handleDevicePageChange} 
            color="primary" 
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenDeviceAssignDialog}
          sx={{ fontWeight: 'bold' }}
        >
          Assign Device
        </Button>
      </Box>
      
      {loadingDevices ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  Name {getSortDirectionIndicator('name')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('type')}
                  style={{ cursor: 'pointer' }}
                >
                  Type {getSortDirectionIndicator('type')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('id')}
                  style={{ cursor: 'pointer' }}
                >
                  Device ID {getSortDirectionIndicator('id')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('serialNo')}
                  style={{ cursor: 'pointer' }}
                >
                  Serial No. {getSortDirectionIndicator('serialNo')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('description')}
                  style={{ cursor: 'pointer' }}
                >
                  Description {getSortDirectionIndicator('description')}
                </TableCell>
                <TableCell 
                  sx={tableHeaderCellStyle} 
                  onClick={() => requestSort('status')}
                  style={{ cursor: 'pointer' }}
                >
                  Status {getSortDirectionIndicator('status')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Attributes</TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDevices && paginatedDevices.length > 0 ? (
                paginatedDevices.map((device: any) => (
                  <TableRow key={device.id}>
                    <TableCell sx={tableBodyCellStyle}>{device.name}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.type}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.id}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.serialNo}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>{device.description}</TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Chip
                        label={device.status}
                        color={device.status === "Activated" ? "success" :
                              device.status === "Assigned" ? "info" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <Tooltip 
                        leaveDelay={0}
                        title={
                        <List dense>
                          {device.attributes.map((attr: { key: string, value: string }, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={`${attr.key}: ${attr.value}`} />
                            </ListItem>
                          ))}
                        </List>
                      }>
                        <span style={{ cursor: 'pointer', color: 'blue' }}>
                          View ({device.attributes.length})
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableBodyCellStyle}>
                      <IconButton
                        size="small"
                        onClick={() => handleUnassignDevice(device.id)}
                        aria-label="unassign"
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={tableBodyCellStyle}>No devices found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};
