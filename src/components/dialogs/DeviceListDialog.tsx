import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  Tooltip
} from "@mui/material";
import { DeviceWithTenant } from '../../commons/models.js';
import { DeviceService } from '../../mockAPI/device.service.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../../commons/styles.js';
import { useTranslation } from "react-i18next";

interface DeviceListDialogProps {
  open: boolean;
  onClose: () => void;
  deviceIds: string[];
  title?: string;
}

const deviceService = new DeviceService();

const DeviceListDialog: React.FC<DeviceListDialogProps> = ({
  open,
  onClose,
  deviceIds,
  title = "Devices"
}) => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<DeviceWithTenant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && deviceIds.length > 0) {
      const loadDevices = async () => {
        setLoading(true);
        try {
          const devicesData = await deviceService.getDevicesByIds(deviceIds);
          setDevices(devicesData);
        } catch (error) {
          console.error('Error loading devices:', error);
        } finally {
          setLoading(false);
        }
      };
      loadDevices();
    }
  }, [open, deviceIds]);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="lg"
      actions={
        <CommonDialogActions
          onClose={onClose}
        />
      }
    >
      {loading ? (
        <CircularProgress size={24} sx={{ display: 'block', margin: '20px auto' }} />
      ) : devices.length === 0 ? (
        <Typography align="center">No devices found</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellStyle}>{t('common.tenant')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('common.name')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('common.type')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('device.deviceId')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('device.serialNo')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('common.description')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('common.status')}</TableCell>
                <TableCell sx={tableHeaderCellStyle}>{t('device.attributes')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell sx={tableBodyCellStyle}>{device.tenantName}</TableCell>
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
                          {device.attributes.map((attr, index) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </BaseDialog>
  );
};

export { DeviceListDialog };
