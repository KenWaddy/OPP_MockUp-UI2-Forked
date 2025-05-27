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
  Typography,
  Box
} from '@mui/material';
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../../commons/styles';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

export interface SortableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  sortConfig: SortConfig | null;
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export function SortableTable<T>({
  data,
  columns,
  sortConfig,
  requestSort,
  getSortDirectionIndicator,
  loading = false,
  error = null,
  emptyMessage = "No data found"
}: SortableTableProps<T>) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ mb: 2 }}>
        {error}
      </Typography>
    );
  }

  if (data.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', my: 2 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key as string}
                sx={tableHeaderCellStyle}
                onClick={column.sortable !== false ? () => requestSort(column.key as string) : undefined}
                style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
              >
                {column.label} {column.sortable !== false && getSortDirectionIndicator(column.key as string)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key as string} sx={tableBodyCellStyle}>
                  {column.render 
                    ? column.render((row as any)[column.key], row)
                    : (row as any)[column.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
