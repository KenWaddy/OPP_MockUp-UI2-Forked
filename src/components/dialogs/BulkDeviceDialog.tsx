import React, { useState } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Divider
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../../commons/styles.js';
import { Attribute, DeviceWithTenant, UnregisteredDevice } from '../../commons/models.js';
import { BaseDialog } from './BaseDialog';
import { CommonDialogActions } from './CommonDialogActions';
import { useTranslation } from "react-i18next";

interface TemplateField {
  name: string;
  type: 'Decimal' | 'Hex' | 'Alphabet';
  startValue: string;
  endValue: string;
  digits?: number;
  incrementBy: string;
}

interface BulkDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  deviceTypes: string[];
  onSave?: (deviceName: string, serialNo: string, deviceType: string, description: string, attributes: Attribute[], quantity: number, deviceNameFields: TemplateField[], deviceNameTemplate: string) => void;
}

export const BulkDeviceDialog: React.FC<BulkDeviceDialogProps> = ({
  open,
  onClose,
  deviceTypes,
  onSave
}) => {
  const { t } = useTranslation();
  
  const [deviceType, setDeviceType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ key: '', value: '' });
  
  const [deviceNameTemplate, setDeviceNameTemplate] = useState<string>('管理番号-{field1}');
  const [deviceNameFields, setDeviceNameFields] = useState<TemplateField[]>([
    { name: 'field1', type: 'Decimal', startValue: '1', endValue: '100', digits: 3, incrementBy: '' },
    { name: 'field2', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' },
    { name: 'field3', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' },
    { name: 'field4', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' },
    { name: 'field5', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' }
  ]);
  
  const [serialNoTemplate, setSerialNoTemplate] = useState<string>('SN-{field1}');
  const [serialNoFields, setSerialNoFields] = useState<TemplateField[]>([
    { name: 'field1', type: 'Decimal', startValue: '1', endValue: '100', digits: 4, incrementBy: '' },
    { name: 'field2', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' },
    { name: 'field3', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' },
    { name: 'field4', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' },
    { name: 'field5', type: 'Decimal', startValue: '', endValue: '', digits: 0, incrementBy: '' }
  ]);
  
  const [quantity, setQuantity] = useState<number>(1);
  
  const generateDeviceNamePreview = () => {
    let preview = deviceNameTemplate;
    deviceNameFields.forEach(field => {
      if (field.startValue) {
        const paddedValue = applyZeroPadding(field.startValue, field.digits || 0, field.type);
        preview = preview.replace(`{${field.name}}`, paddedValue);
      }
    });
    return preview;
  };
  
  const generateSerialNoPreview = () => {
    let preview = serialNoTemplate;
    serialNoFields.forEach(field => {
      if (field.startValue) {
        const paddedValue = applyZeroPadding(field.startValue, field.digits || 0, field.type);
        preview = preview.replace(`{${field.name}}`, paddedValue);
      }
    });
    return preview;
  };
  
  const handleDeviceTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDeviceType(event.target.value as string);
  };
  
  const handleAddAttribute = () => {
    if (newAttribute.key.trim() !== '') {
      setAttributes([...attributes, { ...newAttribute }]);
      setNewAttribute({ key: '', value: '' });
    }
  };
  
  const handleRemoveAttribute = (index: number) => {
    const newList = [...attributes];
    newList.splice(index, 1);
    setAttributes(newList);
  };
  
  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };
  
  const handleNewAttributeChange = (field: 'key' | 'value', value: string) => {
    setNewAttribute({
      ...newAttribute,
      [field]: value
    });
  };
  
  const handleDeviceNameFieldChange = (index: number, field: keyof TemplateField, value: any) => {
    const newFields = [...deviceNameFields];
    let processedValue = value;

    if (field === 'startValue' || field === 'endValue') {
      const currentType = newFields[index].type;
      if (currentType === 'Decimal') {
        processedValue = validateDecimalInput(value);
      } else if (currentType === 'Hex') {
        processedValue = validateHexInput(value);
      } else if (currentType === 'Alphabet') {
        processedValue = validateAlphabetInput(value);
      }
    }

    if (field === 'digits') {
      processedValue = Math.min(Math.max(parseInt(value) || 0, 0), 10);
    }

    if (field === 'type') {
      if (value === 'Alphabet') {
        newFields[index] = {
          ...newFields[index],
          [field]: processedValue,
          digits: 1
        };
      } else {
        newFields[index] = {
          ...newFields[index],
          [field]: processedValue
        };
      }
    } else {
      newFields[index] = {
        ...newFields[index],
        [field]: processedValue
      };
    }

    setDeviceNameFields(newFields);
  };
  
  const handleSerialNoFieldChange = (index: number, field: keyof TemplateField, value: any) => {
    const newFields = [...serialNoFields];
    let processedValue = value;

    if (field === 'startValue' || field === 'endValue') {
      const currentType = newFields[index].type;
      if (currentType === 'Decimal') {
        processedValue = validateDecimalInput(value);
      } else if (currentType === 'Hex') {
        processedValue = validateHexInput(value);
      } else if (currentType === 'Alphabet') {
        processedValue = validateAlphabetInput(value);
      }
    }

    if (field === 'digits') {
      processedValue = Math.min(Math.max(parseInt(value) || 0, 0), 10);
    }

    if (field === 'type') {
      if (value === 'Alphabet') {
        newFields[index] = {
          ...newFields[index],
          [field]: processedValue,
          digits: 1
        };
      } else {
        newFields[index] = {
          ...newFields[index],
          [field]: processedValue
        };
      }
    } else {
      newFields[index] = {
        ...newFields[index],
        [field]: processedValue
      };
    }

    setSerialNoFields(newFields);
  };

  const validateDecimalInput = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
  };

  const validateHexInput = (value: string): string => {
    return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  };

  const validateAlphabetInput = (value: string): string => {
    const cleaned = value.replace(/[^A-Za-z]/g, '').toUpperCase();
    return cleaned.length > 1 ? cleaned.charAt(0) : cleaned;
  };

  const applyZeroPadding = (value: string, digits: number, type: string): string => {
    if (digits === 0 || type === 'Alphabet') return value;
    
    if (type === 'Decimal') {
      return value.padStart(digits, '0');
    } else if (type === 'Hex') {
      return value.padStart(digits, '0');
    }
    return value;
  };
  
  const incrementValue = (value: string, type: 'Decimal' | 'Hex' | 'Alphabet', startValue: string, endValue: string): string => {
    if (type === 'Decimal') {
      const num = parseInt(value) + 1;
      const end = parseInt(endValue);
      return num > end ? startValue : num.toString();
    } else if (type === 'Hex') {
      const num = parseInt(value, 16) + 1;
      const end = parseInt(endValue, 16);
      return num > end ? startValue : num.toString(16).toUpperCase();
    } else if (type === 'Alphabet') {
      const char = value.charCodeAt(0) + 1;
      const endChar = endValue.charCodeAt(0);
      return char > endChar ? startValue : String.fromCharCode(char);
    }
    return value;
  };

  const generateDeviceNameForIndex = (template: string, fields: TemplateField[], index: number): string => {
    let result = template;
    fields.forEach(field => {
      if (field.startValue) {
        let currentValue = field.startValue;
        for (let i = 0; i < index; i++) {
          currentValue = incrementValue(currentValue, field.type, field.startValue, field.endValue);
        }
        const paddedValue = applyZeroPadding(currentValue, field.digits || 0, field.type);
        result = result.replace(`{${field.name}}`, paddedValue);
      }
    });
    return result;
  };
  
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Bulk Device Creation"
      contentProps={{ dividers: true }}
      maxWidth="lg"
    >
      <Grid container spacing={3}>
        {/* Common Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Common
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {/* Device Type Selection */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Device Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={deviceType}
                    onChange={handleDeviceTypeChange as any}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select Device Type</MenuItem>
                    {deviceTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Description */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={1}
                />
              </Grid>
              
              {/* Attributes Table */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Attributes
                </Typography>
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
                      {attributes.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              value={attr.key}
                              onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveAttribute(index)}
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
                            onChange={(e) => handleNewAttributeChange('key', e.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="New Value"
                            value={newAttribute.value}
                            onChange={(e) => handleNewAttributeChange('value', e.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={tableBodyCellStyle}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={handleAddAttribute}
                            disabled={!newAttribute.key.trim()}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Device Name Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Device Name
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {/* Template */}
              <Grid item xs={12} sm={8}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Template
                </Typography>
                <TextField
                  fullWidth
                  value={deviceNameTemplate}
                  onChange={(e) => setDeviceNameTemplate(e.target.value)}
                  helperText="Use {field1}, {field2}, etc. as placeholders"
                />
              </Grid>
              
              {/* Preview */}
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Preview
                </Typography>
                <TextField
                  fullWidth
                  value={generateDeviceNamePreview()}
                  InputProps={{
                    readOnly: true,
                    sx: { bgcolor: 'grey.100' }
                  }}
                />
              </Grid>
              
              {/* Fields Table */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Fields
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeaderCellStyle}>Field Name</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Start Value</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>End Value</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Digits</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Increment by</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deviceNameFields.map((field, index) => (
                        <TableRow key={index}>
                          <TableCell sx={tableBodyCellStyle}>
                            {field.name}
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <Select
                              fullWidth
                              size="small"
                              value={field.type}
                              onChange={(e) => handleDeviceNameFieldChange(index, 'type', e.target.value)}
                            >
                              <MenuItem value="Decimal">Decimal</MenuItem>
                              <MenuItem value="Hex">Hex</MenuItem>
                              <MenuItem value="Alphabet">Alphabet</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              value={field.startValue}
                              onChange={(e) => handleDeviceNameFieldChange(index, 'startValue', e.target.value)}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              value={field.endValue}
                              onChange={(e) => handleDeviceNameFieldChange(index, 'endValue', e.target.value)}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={field.digits || ''}
                              onChange={(e) => handleDeviceNameFieldChange(index, 'digits', parseInt(e.target.value) || 0)}
                              disabled={field.type === 'Alphabet'}
                              inputProps={{ min: 0, max: 10 }}
                              helperText={field.type === 'Alphabet' ? 'Fixed to 1' : 'Range: 0-10'}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <Select
                              fullWidth
                              size="small"
                              value={field.incrementBy}
                              onChange={(e) => handleDeviceNameFieldChange(index, 'incrementBy', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">None</MenuItem>
                              {deviceNameFields
                                .filter((_, fieldIndex) => fieldIndex !== index)
                                .map((otherField) => (
                                  <MenuItem key={otherField.name} value={otherField.name}>
                                    {otherField.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Serial No. Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Serial No.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {/* Template */}
              <Grid item xs={12} sm={8}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Template
                </Typography>
                <TextField
                  fullWidth
                  value={serialNoTemplate}
                  onChange={(e) => setSerialNoTemplate(e.target.value)}
                  helperText="Use {field1}, {field2}, etc. as placeholders"
                />
              </Grid>
              
              {/* Preview */}
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Preview
                </Typography>
                <TextField
                  fullWidth
                  value={generateSerialNoPreview()}
                  InputProps={{
                    readOnly: true,
                    sx: { bgcolor: 'grey.100' }
                  }}
                />
              </Grid>
              
              {/* Fields Table */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Fields
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeaderCellStyle}>Field Name</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Type</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Start Value</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>End Value</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Digits</TableCell>
                        <TableCell sx={tableHeaderCellStyle}>Increment by</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {serialNoFields.map((field, index) => (
                        <TableRow key={index}>
                          <TableCell sx={tableBodyCellStyle}>
                            {field.name}
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <Select
                              fullWidth
                              size="small"
                              value={field.type}
                              onChange={(e) => handleSerialNoFieldChange(index, 'type', e.target.value)}
                            >
                              <MenuItem value="Decimal">Decimal</MenuItem>
                              <MenuItem value="Hex">Hex</MenuItem>
                              <MenuItem value="Alphabet">Alphabet</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              value={field.startValue}
                              onChange={(e) => handleSerialNoFieldChange(index, 'startValue', e.target.value)}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              value={field.endValue}
                              onChange={(e) => handleSerialNoFieldChange(index, 'endValue', e.target.value)}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={field.digits || ''}
                              onChange={(e) => handleSerialNoFieldChange(index, 'digits', parseInt(e.target.value) || 0)}
                              disabled={field.type === 'Alphabet'}
                              inputProps={{ min: 0, max: 10 }}
                              helperText={field.type === 'Alphabet' ? 'Fixed to 1' : 'Range: 0-10'}
                            />
                          </TableCell>
                          <TableCell sx={tableBodyCellStyle}>
                            <Select
                              fullWidth
                              size="small"
                              value={field.incrementBy}
                              onChange={(e) => handleSerialNoFieldChange(index, 'incrementBy', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">None</MenuItem>
                              {serialNoFields
                                .filter((_, fieldIndex) => fieldIndex !== index)
                                .map((otherField) => (
                                  <MenuItem key={otherField.name} value={otherField.name}>
                                    {otherField.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Number of Devices Section */}
        <Grid item xs={12}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Add Devices(Bulk)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Number of devices to add
                </Typography>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 2000))}
                  InputProps={{
                    inputProps: { min: 1, max: 2000 }
                  }}
                  helperText="Enter a value between 1 and 2000"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  sx={{ mt: 0.5 }}
                  onClick={() => onSave && onSave(
                    generateDeviceNamePreview(),
                    generateSerialNoPreview(),
                    deviceType,
                    description,
                    attributes,
                    quantity,
                    deviceNameFields,
                    deviceNameTemplate
                  )}
                >
                  RUN DEVICE CREATION
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </BaseDialog>
  );
};
