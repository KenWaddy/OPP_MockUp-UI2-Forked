import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  Alert,
  IconButton,
  Chip
} from "@mui/material";
import { tableHeaderCellStyle, tableBodyCellStyle, tableContainerStyle } from '../commons/styles.js';
import { formatContactName } from '../mockAPI/utils.js';
import { TenantService, SubscriptionService } from '../mockAPI/index.js';
import { TenantType, Subscription } from '../commons/models.js';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FilterSection } from '../components/tables/filter_section';

const tenantService = new TenantService();
const subscriptionService = new SubscriptionService();

interface SubscriptionMap {
  [key: string]: Subscription | null;
}

export const TenantList: React.FC<{
  onEditTenant?: (tenant: TenantType) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onTenantSelect?: (tenantId: string) => void;
}> = ({ onEditTenant, onDeleteTenant, onTenantSelect }) => {
  const [tenants, setTenants] = useState<TenantType[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100, // Default to 100 rows
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState<{
    contractType: string;
    status: string;
    textSearch: string;
  }>({
    contractType: "",
    status: "",
    textSearch: "",
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const contractTypeOptions = ["Evergreen", "Fixed-term", "Trial"];
  const statusOptions = ["Active", "Inactive", "Pending", "Suspended"];

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const serviceFilters: Record<string, any> = {};
      if (filters.contractType) serviceFilters.contract = filters.contractType;
      if (filters.status) serviceFilters.subscriptionStatus = filters.status;
      if (filters.textSearch) serviceFilters.textSearch = filters.textSearch;

      const serviceSort = sortConfig ? {
        field: sortConfig.key === 'tenant' ? 'name' :
               sortConfig.key === 'owner' ? 'owner' :
               sortConfig.key === 'email' ? 'email' :
               sortConfig.key === 'subscription.status' ? 'status' :
               sortConfig.key,
        order: sortConfig.direction === 'ascending' ? 'asc' : 'desc' as 'asc' | 'desc'
      } : undefined;

      const response = await tenantService.getTenants({
        page: pagination.page,
        limit: pagination.limit,
        filters: serviceFilters,
        sort: serviceSort
      });

      setTenants(response.data);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });
      
      const subscriptionMap: SubscriptionMap = {};
      
      await Promise.all(
        response.data.map(async (tenant) => {
          try {
            const subscriptionResponse = await subscriptionService.getSubscriptionById(tenant.subscriptionId);
            subscriptionMap[tenant.subscriptionId] = subscriptionResponse.data;
          } catch (error) {
            console.error(`Error fetching subscription for tenant ${tenant.id}:`, error);
            subscriptionMap[tenant.subscriptionId] = null;
          }
        })
      );
      
      setSubscriptions(subscriptionMap);
    } catch (err) {
      setError(`Error loading tenants: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [pagination.page, pagination.limit, filters, sortConfig]);

  const handleRowClick = (id: string) => {
    if (onTenantSelect) {
      onTenantSelect(id);
    } else {
      localStorage.setItem('selectedTenantId', id);
      const tenantPageEvent = new CustomEvent('navigate-to-tenant', {
        detail: { tenant: { id: id } }
      });
      window.dispatchEvent(tenantPageEvent);
    }
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ ...pagination, page });
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }

    setSortConfig({ key, direction });
  };
  
  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending'
      ? <ArrowUpwardIcon fontSize="small" />
      : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <div className="tenant-list">
      {/* Filter section */}
      <FilterSection
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={() => setFilters({
          contractType: "",
          status: "",
          textSearch: "",
        })}
        filterFields={[
          {
            type: 'text',
            key: 'textSearch',
            label: 'Text Search',
            placeholder: 'Search by Tenant Name, Contact Name, or Email Address',
            gridSize: 3
          },
          {
            type: 'select',
            key: 'contractType',
            label: 'Subscription Type',
            options: contractTypeOptions,
            gridSize: 3
          },
          {
            type: 'select',
            key: 'status',
            label: 'Subscription Status',
            options: statusOptions,
            gridSize: 3
          }
        ]}
      />

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
      )}

      {/* Pagination - Positioned above the table */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="rows-per-page-label">Rows</InputLabel>
          <Select
            labelId="rows-per-page-label"
            value={pagination.limit}
            label="Rows"
            onChange={(e) => {
              setPagination({ ...pagination, page: 1, limit: Number(e.target.value) });
            }}
            sx={{ backgroundColor: "white" }}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
          </Select>
        </FormControl>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={tableContainerStyle}>
          <Table size="small" aria-label="tenant list table">
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => requestSort('tenant')}
                  sx={tableHeaderCellStyle}
                >
                  Tenant {getSortDirectionIndicator('tenant')}
                </TableCell>
                <TableCell
                  onClick={() => requestSort('contact')}
                  sx={tableHeaderCellStyle}
                >
                  Contact {getSortDirectionIndicator('contact')}
                </TableCell>
                <TableCell
                  onClick={() => requestSort('email')}
                  sx={tableHeaderCellStyle}
                >
                  Email {getSortDirectionIndicator('email')}
                </TableCell>
                <TableCell
                  onClick={() => requestSort('type')}
                  sx={tableHeaderCellStyle}
                >
                  Type {getSortDirectionIndicator('type')}
                </TableCell>
                <TableCell
                  onClick={() => requestSort('status')}
                  sx={tableHeaderCellStyle}
                >
                  Status {getSortDirectionIndicator('status')}
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.length > 0 ? (
                tenants.map((tenant) => {
                  const subscription = subscriptions[tenant.subscriptionId];
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell sx={tableBodyCellStyle}>
                        <span
                          className="clickable"
                          onClick={() => handleRowClick(tenant.id)}
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          {tenant.name}
                        </span>
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        {formatContactName(
                          tenant.contact.first_name,
                          tenant.contact.last_name,
                          tenant.contact.language
                        )}
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>{tenant.contact.email}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>{subscription?.type || 'N/A'}</TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        <Chip
                          label={subscription?.status || 'N/A'}
                          color={
                            subscription?.status === "Active" ? "success" :
                            subscription?.status === "Cancelled" ? "error" :
                            "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={tableBodyCellStyle}>
                        {onEditTenant && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTenant(tenant);
                            }}
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onDeleteTenant && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTenant(tenant.id);
                            }}
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={tableBodyCellStyle}>No tenants match the filter criteria</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
