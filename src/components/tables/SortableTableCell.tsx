import React from 'react';
import { TableCell } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { SortConfig } from '../../hooks/useSorting';

interface SortableTableCellProps {
  sortKey: string;
  sortConfig: SortConfig | null;
  onRequestSort: (key: string) => void;
  children: React.ReactNode;
  sx?: any;
  align?: 'left' | 'center' | 'right';
}

export const SortableTableCell: React.FC<SortableTableCellProps> = ({
  sortKey,
  sortConfig,
  onRequestSort,
  children,
  sx,
  align = 'left'
}) => {
  const getSortDirectionIndicator = () => {
    if (!sortConfig || sortConfig.key !== sortKey) {
      return null;
    }
    return sortConfig.direction === 'ascending'
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <TableCell
      sx={{ 
        cursor: 'pointer',
        ...sx 
      }}
      align={align}
      onClick={() => onRequestSort(sortKey)}
    >
      {children} {getSortDirectionIndicator()}
    </TableCell>
  );
};
