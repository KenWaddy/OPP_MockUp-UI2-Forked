import React, { useState, useEffect } from "react";
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
  Button,
  Switch,
  FormControlLabel,
  Alert
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { tableHeaderCellStyle, tableBodyCellStyle } from '../../commons/styles.js';
import { UnregisteredDevice } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';
import { useTranslation } from "react-i18next";

interface FieldConfig {
  name: string;
  type: 'Decimal' | 'Hex' | 'Alphabet';
  startValue: string;
  endValue: string;
  digits?: number;
  enableLooping: boolean;
}

interface BulkDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (devices: UnregisteredDevice[]) => void;
  deviceTypes: string[];
}

export const BulkDeviceDialog: React.FC<BulkDeviceDialogProps> = ({
  open,
  onClose,
  onSave,
  deviceTypes
}) => {
  const { t } = useTranslation();
  const [deviceType, setDeviceType] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState('');
  const [deviceNameTemplate, setDeviceNameTemplate] = useState('');
  const [serialNumberTemplate, setSerialNumberTemplate] = useState('');
  const [totalDevices, setTotalDevices] = useState(1);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [previewDevice, setPreviewDevice] = useState<{ name: string; serialNo: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const extractPlaceholders = (template: string): string[] => {
    const matches = template.match(/\{field[1-5]\}/g);
    return matches ? [...new Set(matches)] : [];
  };

  const validateTemplate = (template: string): string[] => {
    const errors: string[] = [];
    const placeholders = extractPlaceholders(template);
    
    if (placeholders.length > 5) {
      errors.push('Maximum 5 placeholders allowed');
    }
    
    const invalidMatches = template.match(/\{field[^1-5\}].*?\}/g);
    if (invalidMatches) {
      errors.push('Only {field1} to {field5} placeholders are allowed');
    }
    
    return errors;
  };

  const generateFieldValue = (config: FieldConfig, index: number): string => {
    const { type, startValue, endValue, digits, enableLooping } = config;
    
    if (type === 'Decimal') {
      const start = parseInt(startValue) || 0;
      const end = parseInt(endValue) || start;
      const range = end - start + 1;
      const value = enableLooping ? start + (index % range) : Math.min(start + index, end);
      return digits ? value.toString().padStart(digits, '0') : value.toString();
    } else if (type === 'Hex') {
      const start = parseInt(startValue, 16) || 0;
      const end = parseInt(endValue, 16) || start;
      const range = end - start + 1;
      const value = enableLooping ? start + (index % range) : Math.min(start + index, end);
      return (digits ? value.toString(16).padStart(digits, '0') : value.toString(16)).toUpperCase();
    } else if (type === 'Alphabet') {
      const convertAlphaToNum = (alpha: string) => {
        return alpha.split('').reduce((acc, char, i) => acc + (char.charCodeAt(0) - 65) * Math.pow(26, alpha.length - 1 - i), 0);
      };
      const convertNumToAlpha = (num: number, length: number = 2) => {
        let result = '';
        for (let i = length - 1; i >= 0; i--) {
          result = String.fromCharCode(65 + (num % 26)) + result;
          num = Math.floor(num / 26);
        }
        return result;
      };
      
      const start = convertAlphaToNum(startValue || 'AA');
      const end = convertAlphaToNum(endValue || 'ZZ');
      const range = end - start + 1;
      const value = enableLooping ? start + (index % range) : Math.min(start + index, end);
      return convertNumToAlpha(value, digits || 2);
    }
    return '';
  };

  const generatePreview = () => {
    if (!deviceNameTemplate && !serialNumberTemplate) return null;
    
    const allPlaceholders = [
      ...extractPlaceholders(deviceNameTemplate),
      ...extractPlaceholders(serialNumberTemplate)
    ];
    const uniquePlaceholders = [...new Set(allPlaceholders)];
    
    let previewName = deviceNameTemplate;
    let previewSerial = serialNumberTemplate;
    
    uniquePlaceholders.forEach(placeholder => {
      const fieldName = placeholder.slice(1, -1);
      const config = fieldConfigs.find(c => c.name === fieldName);
      if (config) {
        const value = generateFieldValue(config, 0);
        previewName = previewName.replace(new RegExp(`\\${placeholder}`, 'g'), value);
        previewSerial = previewSerial.replace(new RegExp(`\\${placeholder}`, 'g'), value);
      }
    });
    
    return { name: previewName, serialNo: previewSerial };
  };

  const updateFieldConfigs = () => {
    const allPlaceholders = [
      ...extractPlaceholders(deviceNameTemplate),
      ...extractPlaceholders(serialNumberTemplate)
    ];
    const uniquePlaceholders = [...new Set(allPlaceholders)];
    
    const newConfigs: FieldConfig[] = uniquePlaceholders.map(placeholder => {
      const fieldName = placeholder.slice(1, -1);
      const existingConfig = fieldConfigs.find(c => c.name === fieldName);
      return existingConfig || {
        name: fieldName,
        type: 'Decimal',
        startValue: '1',
        endValue: '100',
        digits: 3,
        enableLooping: false
      };
    });
    
    setFieldConfigs(newConfigs);
    
    const unconfiguredFields = uniquePlaceholders.filter(placeholder => {
      const fieldName = placeholder.slice(1, -1);
      return !fieldConfigs.find(c => c.name === fieldName);
    });
    
    const newWarnings: string[] = [];
    if (unconfiguredFields.length > 0) {
      newWarnings.push(`Unconfigured placeholders detected: ${unconfiguredFields.join(', ')}`);
    }
    
    const templateErrors = [
      ...validateTemplate(deviceNameTemplate),
      ...validateTemplate(serialNumberTemplate)
    ];
    newWarnings.push(...templateErrors);
    
    setWarnings(newWarnings);
  };

  useEffect(() => {
    updateFieldConfigs();
  }, [deviceNameTemplate, serialNumberTemplate]);

  useEffect(() => {
    setPreviewDevice(generatePreview());
  }, [deviceNameTemplate, serialNumberTemplate, fieldConfigs]);

  const renderFieldConfigTable = () => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeaderCellStyle}>Field Name</TableCell>
            <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
            <TableCell sx={tableHeaderCellStyle}>Start Value</TableCell>
            <TableCell sx={tableHeaderCellStyle}>End Value</TableCell>
            <TableCell sx={tableHeaderCellStyle}>Digits</TableCell>
            <TableCell sx={tableHeaderCellStyle}>Enable Looping</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldConfigs.map((config, index) => (
            <TableRow key={config.name}>
              <TableCell sx={tableBodyCellStyle}>{config.name}</TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={config.type}
                    onChange={(e) => {
                      const newConfigs = [...fieldConfigs];
                      newConfigs[index].type = e.target.value as 'Decimal' | 'Hex' | 'Alphabet';
                      setFieldConfigs(newConfigs);
                    }}
                  >
                    <MenuItem value="Decimal">Decimal</MenuItem>
                    <MenuItem value="Hex">Hex</MenuItem>
                    <MenuItem value="Alphabet">Alphabet</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <TextField
                  size="small"
                  fullWidth
                  value={config.startValue}
                  onChange={(e) => {
                    const newConfigs = [...fieldConfigs];
                    newConfigs[index].startValue = e.target.value;
                    setFieldConfigs(newConfigs);
                  }}
                />
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <TextField
                  size="small"
                  fullWidth
                  value={config.endValue}
                  onChange={(e) => {
                    const newConfigs = [...fieldConfigs];
                    newConfigs[index].endValue = e.target.value;
                    setFieldConfigs(newConfigs);
                  }}
                />
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={config.digits || ''}
                  onChange={(e) => {
                    const newConfigs = [...fieldConfigs];
                    newConfigs[index].digits = parseInt(e.target.value) || undefined;
                    setFieldConfigs(newConfigs);
                  }}
                  inputProps={{ min: 1 }}
                />
              </TableCell>
              <TableCell sx={tableBodyCellStyle}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enableLooping}
                      onChange={(e) => {
                        const newConfigs = [...fieldConfigs];
                        newConfigs[index].enableLooping = e.target.checked;
                        setFieldConfigs(newConfigs);
                      }}
                      size="small"
                    />
                  }
                  label=""
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const generateDevices = (): UnregisteredDevice[] => {
    const devices: UnregisteredDevice[] = [];
    
    for (let i = 0; i < totalDevices; i++) {
      const allPlaceholders = [
        ...extractPlaceholders(deviceNameTemplate),
        ...extractPlaceholders(serialNumberTemplate)
      ];
      const uniquePlaceholders = [...new Set(allPlaceholders)];
      
      let deviceName = deviceNameTemplate;
      let serialNumber = serialNumberTemplate;
      
      uniquePlaceholders.forEach(placeholder => {
        const fieldName = placeholder.slice(1, -1);
        const config = fieldConfigs.find(c => c.name === fieldName);
        if (config) {
          const value = generateFieldValue(config, i);
          deviceName = deviceName.replace(new RegExp(`\\${placeholder}`, 'g'), value);
          serialNumber = serialNumber.replace(new RegExp(`\\${placeholder}`, 'g'), value);
        }
      });
      
      const device: UnregisteredDevice = {
        id: `d-bulk-${Date.now()}-${i}`,
        name: deviceName,
        type: deviceType,
        serialNo: serialNumber,
        description: description,
        status: "Registered",
        attributes: attributes ? attributes.split(',').map(attr => {
          const [key, value] = attr.trim().split(':');
          return { key: key?.trim() || '', value: value?.trim() || '' };
        }).filter(attr => attr.key) : [],
        isUnregistered: true
      };
      
      devices.push(device);
    }
    
    return devices;
  };

  const handleSave = () => {
    const devices = generateDevices();
    onSave(devices);
    onClose();
  };

  const isValid = deviceType && deviceNameTemplate && serialNumberTemplate && totalDevices > 0;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Bulk Add Devices"
      maxWidth="lg"
      actions={
        <CommonDialogActions
          onClose={onClose}
          onSave={handleSave}
          saveDisabled={!isValid}
        />
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Device Type</InputLabel>
            <Select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              label="Device Type"
            >
              {deviceTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Attributes (comma-separated key:value pairs)"
            value={attributes}
            onChange={(e) => setAttributes(e.target.value)}
            placeholder="e.g., CPU:8 cores, RAM:16GB, OS:Linux"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Device Name Template"
            value={deviceNameTemplate}
            onChange={(e) => setDeviceNameTemplate(e.target.value)}
            placeholder="e.g., 管理番号-{field1}_{field2}-{field3}"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Serial Number Template"
            value={serialNumberTemplate}
            onChange={(e) => setSerialNumberTemplate(e.target.value)}
            placeholder="e.g., SN-{field1}-{field2}"
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Number of Devices"
            type="number"
            value={totalDevices}
            onChange={(e) => setTotalDevices(parseInt(e.target.value) || 1)}
            margin="normal"
            inputProps={{ min: 1, max: 1000 }}
          />
        </Grid>
        
        {fieldConfigs.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Field Configuration
            </Typography>
            {renderFieldConfigTable()}
          </Grid>
        )}
        
        {previewDevice && (
          <Grid item xs={12}>
            <Alert severity="info">
              <strong>Preview (First Device):</strong><br />
              Name: {previewDevice.name}<br />
              Serial: {previewDevice.serialNo}
            </Alert>
          </Grid>
        )}
        
        {warnings.length > 0 && (
          <Grid item xs={12}>
            {warnings.map((warning, index) => (
              <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                {warning}
              </Alert>
            ))}
          </Grid>
        )}
      </Grid>
    </BaseDialog>
  );
};
