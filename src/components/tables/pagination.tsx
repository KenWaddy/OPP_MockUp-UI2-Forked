import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationComponentProps {
  pagination: PaginationState;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: number[];
  sx?: any;
}

export const PaginationComponent: React.FC<PaginationComponentProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [100, 500, 2000],
  sx
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      mt: 2, 
      mb: 2, 
      gap: 2,
      ...sx 
    }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="rows-per-page-label">{t('common.rows')}</InputLabel>
        <Select
          labelId="rows-per-page-label"
          value={pagination.limit}
          label={t('common.rows')}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          sx={{ backgroundColor: "white" }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>{size}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Pagination
        count={pagination.totalPages}
        page={pagination.page}
        onChange={onPageChange}
        color="primary"
      />
    </Box>
  );
};
