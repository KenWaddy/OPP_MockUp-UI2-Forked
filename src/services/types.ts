import { TenantType, UserType, DeviceType2, DeviceWithTenant, DeviceContractItem, UnregisteredDeviceType } from '../mocks/types.js';
import { Tenant, User, Device, Billing, UnregisteredDevice } from '../mocks/data/types.js';

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
  getTenants(params: PaginationParams): Promise<PaginatedResponse<TenantType>>;
  getTenantById(id: string, includeUsers?: boolean, includeDevices?: boolean, includeBilling?: boolean): Promise<ItemResponse<TenantType>>;
  getAllTenants(): Promise<TenantType[]>;
}

export interface IDeviceService {
  getDevices(params: PaginationParams): Promise<PaginatedResponse<DeviceWithTenant | UnregisteredDevice>>;
  getDevicesForTenant(subscriptionId: string, params: PaginationParams): Promise<PaginatedResponse<Device>>;
  getAllDevices(): Promise<(DeviceWithTenant | UnregisteredDevice)[]>;
}

export interface IBillingService {
  getBillingItems(params: PaginationParams): Promise<PaginatedResponse<Billing>>;
  getAllBillingItems(): Promise<Billing[]>;
}

export interface IUserService {
  getUsersForTenant(subscriptionId: string, params: PaginationParams): Promise<PaginatedResponse<User>>;
  getAllUsers(): Promise<User[]>;
}
