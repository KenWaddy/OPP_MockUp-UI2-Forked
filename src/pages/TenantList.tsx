import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Alert,
  IconButton,
  Chip
} from "@mui/material";
import { formatContactName } from '../mockAPI/utils.js';
import { TenantService, SubscriptionService } from '../mockAPI/index.js';
import { TenantType, Subscription } from '../commons/models.js';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FilterSection } from '../components/tables/filter_section';
import { useSorting } from '../hooks/useSorting';
import { CommonTable, ColumnDefinition } from '../components/tables';

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
  
  const { sortConfig, requestSort } = useSorting();

  const contractTypeOptions = ["Evergreen", "Termed"];
  const statusOptions = ["Active", "Cancelled"];

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const serviceFilters: Record<string, any> = {};
      if (filters.contractType) serviceFilters.contractType = filters.contractType;
      if (filters.status) serviceFilters.status = filters.status;
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
  

  const columns: ColumnDefinition<TenantType>[] = [
    {
      key: 'name',
      label: 'Tenant',
      sortable: true,
      sortKey: 'tenant',
      render: (tenant) => (
        <span
          className="clickable"
          onClick={() => handleRowClick(tenant.id)}
          style={{ cursor: 'pointer', color: 'blue' }}
        >
          {tenant.name}
        </span>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      sortable: true,
      render: (tenant) => formatContactName(
        tenant.contact.first_name,
        tenant.contact.last_name,
        tenant.contact.language
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (tenant) => tenant.contact.email
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (tenant) => {
        const subscription = subscriptions[tenant.subscriptionId];
        return subscription?.type || 'N/A';
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (tenant) => {
        const subscription = subscriptions[tenant.subscriptionId];
        return (
          <Chip
            label={subscription?.status || 'N/A'}
            color={
              subscription?.status === "Active" ? "success" :
              subscription?.status === "Cancelled" ? "error" :
              "default"
            }
            size="small"
          />
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (tenant) => (
        <>
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
        </>
      )
    }
  ];

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

      {/* Common Table */}
      <CommonTable
        data={tenants}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="No tenants match the filter criteria"
        sortConfig={sortConfig || null}
        onRequestSort={requestSort}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        pageSizeOptions={[20, 100, 500]}
      />
    </div>
  );
};
