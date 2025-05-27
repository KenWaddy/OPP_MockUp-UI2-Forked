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

export interface FilterField {
  type: 'text' | 'select' | 'date';
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
  gridSize?: number;
  startAdornment?: boolean;
}

export interface FilterSectionProps {
  title?: string;
  filters: Record<string, any>;
  onFiltersChange: React.Dispatch<React.SetStateAction<Record<string, any>>> | ((filters: Record<string, any>) => void);
  onResetFilters: () => void;
  filterFields: FilterField[];
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title = "Filters",
  filters,
  onFiltersChange,
  onResetFilters,
  filterFields
}) => {
  const handleFilterChange = (key: string, value: any) => {
    if (typeof onFiltersChange === 'function') {
      if (typeof filters === 'object') {
        onFiltersChange({ ...filters, [key]: value });
      } else {
        onFiltersChange((prevFilters: Record<string, any>) => ({ ...prevFilters, [key]: value }));
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
          {title}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onResetFilters}
          startIcon={<FilterListIcon />}
          sx={{ fontWeight: 'bold' }}
        >
          Reset Filters
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
