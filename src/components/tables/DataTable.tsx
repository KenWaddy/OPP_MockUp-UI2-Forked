import React from 'react';
import { Box } from '@mui/material';
import { PaginatedTable, PaginatedTableProps } from './PaginatedTable';
import { SortableTable } from './SortableTable';

export interface DataTableProps<T> extends PaginatedTableProps<T> {
  title?: string;
  actions?: React.ReactNode;
  showPagination?: boolean;
}

export function DataTable<T>({
  title,
  actions,
  showPagination = true,
  ...props
}: DataTableProps<T>) {
  return (
    <Box>
      {/* Header with title and actions */}
      {(title || actions) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {title && (
            <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {title}
            </Box>
          )}
          {actions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions}
            </Box>
          )}
        </Box>
      )}

      {/* Table with or without pagination */}
      {showPagination ? (
        <PaginatedTable {...props} />
      ) : (
        <SortableTable 
          data={props.data}
          columns={props.columns}
          sortConfig={props.sortConfig}
          requestSort={props.requestSort}
          getSortDirectionIndicator={props.getSortDirectionIndicator}
          loading={props.loading}
          error={props.error}
          emptyMessage={props.emptyMessage}
        />
      )}
    </Box>
  );
}
