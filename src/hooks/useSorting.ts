import { useState } from 'react';

export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

export interface UseSortingOptions {
  defaultSortConfig?: SortConfig | null;
  onSortChange?: (sortConfig: SortConfig | null) => void;
}

export const useSorting = (options: UseSortingOptions = {}) => {
  const { defaultSortConfig = null, onSortChange } = options;
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSortConfig);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }

    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    if (onSortChange) {
      onSortChange(newSortConfig);
    }
  };

  return {
    sortConfig,
    requestSort,
    setSortConfig
  };
};
