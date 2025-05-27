import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { SortableTable, SortableTableProps } from './SortableTable';

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTableProps<T> extends SortableTableProps<T> {
  pagination: PaginationConfig;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onLimitChange?: (limit: number) => void;
  rowsPerPageOptions?: number[];
  showRowsPerPage?: boolean;
}

export function PaginatedTable<T>({
  pagination,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [100, 500, 2000],
  showRowsPerPage = true,
  ...tableProps
}: PaginatedTableProps<T>) {
  return (
    <Box>
      {/* Pagination controls above the table */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, gap: 2 }}>
        {showRowsPerPage && onLimitChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="rows-per-page-label">Rows</InputLabel>
            <Select
              labelId="rows-per-page-label"
              value={pagination.limit}
              label="Rows"
              onChange={(e) => onLimitChange(Number(e.target.value))}
              sx={{ backgroundColor: "white" }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Pagination 
          count={pagination.totalPages} 
          page={pagination.page} 
          onChange={onPageChange} 
          color="primary" 
        />
      </Box>

      {/* Table */}
      <SortableTable {...tableProps} />
    </Box>
  );
}
