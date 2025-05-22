/**
 * Converts data to CSV format and triggers a file download
 * @param data Array of objects to convert to CSV
 * @param filename Name of the file to download
 * @param headers Optional custom headers for CSV file
 */
export function exportToCsv<T>(data: T[], filename: string, headers?: string[]): void {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  const csvRows: string[] = [];
  
  const headerFields = headers || Object.keys(data[0] as any);
  csvRows.push(headerFields.join(','));
  
  for (const row of data) {
    const values = headerFields.map(header => {
      const value = getNestedValue(row, header);
      
      const escaped = typeof value === 'string' 
        ? `"${value.replace(/"/g, '""')}"` 
        : value !== null && value !== undefined ? String(value) : '';
      
      return escaped;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper function to get values from nested object properties
 * using dot notation (e.g., "owner.name")
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj) return '';
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) return '';
    value = value[key];
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return value;
}
