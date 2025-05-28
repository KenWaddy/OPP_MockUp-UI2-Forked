import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';

export interface FilterField {
  type: 'text' | 'select' | 'date';
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
  gridSize?: number;
  startAdornment?: boolean;
}

export interface FilterSectionProps<T extends Record<string, any> = Record<string, any>> {
  title?: string;
  filters: T;
  onFiltersChange: React.Dispatch<React.SetStateAction<T>> | ((filters: T) => void);
  onResetFilters: () => void;
  filterFields: FilterField[];
}

export const FilterSection = <T extends Record<string, any> = Record<string, any>>({
  title,
  filters,
  onFiltersChange,
  onResetFilters,
  filterFields
}: FilterSectionProps<T>) => {
  const { t } = useTranslation();
  const handleFilterChange = (key: string, value: any) => {
    if (typeof onFiltersChange === 'function') {
      const updatedFilters = { ...filters, [key]: value } as T;
      
      if (typeof onFiltersChange === 'function' && 'setState' in onFiltersChange) {
        (onFiltersChange as React.Dispatch<React.SetStateAction<T>>)(updatedFilters);
      } else {
        (onFiltersChange as (filters: T) => void)(updatedFilters);
      }
    }
  };

  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            placeholder={field.placeholder}
            value={filters[field.key] || ''}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            InputProps={field.startAdornment ? {
              startAdornment: (
                <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
              ),
            } : undefined}
            sx={{ backgroundColor: "white" }}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={filters[field.key] || ''}
              label={field.label}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              sx={{ backgroundColor: "white" }}
            >
              <MenuItem value="">All</MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            placeholder={field.placeholder}
            value={filters[field.key] || ''}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            sx={{ backgroundColor: "white" }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid #ddd',
        borderRadius: '4px',
        bgcolor: '#F2F2F2'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {title || t('common.filters')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onResetFilters}
          startIcon={<FilterListIcon />}
          sx={{ fontWeight: 'bold' }}
        >
          {t('common.resetFilters')}
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {filterFields.map((field) => (
          <Grid item xs={12} sm={field.gridSize || 3} key={field.key}>
            {renderFilterField(field)}
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
