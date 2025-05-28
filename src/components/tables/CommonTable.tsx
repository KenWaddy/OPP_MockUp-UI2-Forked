import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { SortableTableCell } from './SortableTableCell';
import { PaginationComponent, PaginationState } from './pagination';
import { SortConfig } from '../../hooks/useSorting';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../../commons/styles';

/**
 * Column definition interface for the CommonTable component
 * @template T - The data type for the table rows
 */
export interface ColumnDefinition<T = any> {
  /** Unique identifier for the column */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom sort key if different from column key */
  sortKey?: string;
  /** Text alignment for the column */
  align?: 'left' | 'center' | 'right';
  /** Custom renderer for the cell content */
  render?: (item: T, index: number) => React.ReactNode;
  /** Custom styles for the header cell */
  headerSx?: any;
  /** Custom styles for the body cells */
  cellSx?: any;
}

/**
 * Props interface for the CommonTable component
 * @template T - The data type for the table rows
 */
export interface CommonTableProps<T = any> {
  /** Array of data items to display in the table */
  data: T[];
  /** Column definitions for the table */
  columns: ColumnDefinition<T>[];
  /** Whether the table is in a loading state */
  loading?: boolean;
  /** Error message to display if there's an error */
  error?: string | null;
  /** Message to display when there's no data */
  emptyMessage?: string;
  /** Current sort configuration */
  sortConfig: SortConfig | null;
  /** Callback for when a sort is requested */
  onRequestSort?: (key: string) => void;
  /** Pagination state */
  pagination?: PaginationState;
  /** Callback for when the page changes */
  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  /** Callback for when the page size changes */
  onLimitChange?: (limit: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Callback for when a row is clicked */
  onRowClick?: (item: T, index: number) => void;
  /** Additional props for the Table component */
  tableProps?: any;
  /** Additional props for the TableContainer component */
  containerProps?: any;
}

/**
 * A reusable table component that handles sorting, pagination, loading states, and custom cell rendering
 * @template T - The data type for the table rows
 */
export const CommonTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = "No data available",
  sortConfig,
  onRequestSort,
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions,
  onRowClick,
  tableProps,
  containerProps
}: CommonTableProps<T>) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
        <Typography>{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Pagination above table */}
      {pagination && onPageChange && onLimitChange && (
        <PaginationComponent
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}

      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle} {...containerProps}>
        <Table size="small" {...tableProps}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                column.sortable && onRequestSort ? (
                  <SortableTableCell
                    key={column.key}
                    sortKey={column.sortKey || column.key}
                    sortConfig={sortConfig}
                    onRequestSort={onRequestSort}
                    sx={{ ...tableHeaderCellStyle, ...column.headerSx }}
                    align={column.align}
                  >
                    {column.label}
                  </SortableTableCell>
                ) : (
                  <TableCell
                    key={column.key}
                    sx={{ ...tableHeaderCellStyle, ...column.headerSx }}
                    align={column.align}
                  >
                    {column.label}
                  </TableCell>
                )
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={item.id || index}
                onClick={onRowClick ? () => onRowClick(item, index) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{ ...tableBodyCellStyle, ...column.cellSx }}
                    align={column.align}
                  >
                    {column.render 
                      ? column.render(item, index)
                      : item[column.key] || '—'
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination below table */}
      {pagination && onPageChange && onLimitChange && (
        <PaginationComponent
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={pageSizeOptions}
          sx={{ mt: 2 }}
        />
      )}
    </>
  );
};
