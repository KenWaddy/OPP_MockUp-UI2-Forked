import { Tenant, User, Device, DeviceWithTenant, DeviceContractItem, UnregisteredDevice } from '../mocks/types.js';

export interface PaginationParams {
  page: number;
  limit: number;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ItemResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
}

export interface ITenantService {
  getTenants(params: PaginationParams): Promise<PaginatedResponse<Tenant>>;
  getTenantById(id: string, includeUsers?: boolean, includeDevices?: boolean, includeBilling?: boolean): Promise<ItemResponse<Tenant>>;
  getAllTenants(): Promise<Tenant[]>;
}
