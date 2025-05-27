import { TenantType, UserType, DeviceType2, DeviceWithTenant, DeviceContractItem, UnregisteredDeviceType, Tenant, User, Device, Billing, UnregisteredDevice, Subscription } from '../commons/models.js';

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
  addTenant(tenant: any, subscription: any): Promise<ItemResponse<TenantType>>;
  updateTenant(tenant: any): Promise<ItemResponse<TenantType>>;
  deleteTenant(id: string): Promise<ItemResponse<boolean>>;
}

export interface IDeviceService {
  getDevices(params: PaginationParams): Promise<PaginatedResponse<DeviceWithTenant | UnregisteredDevice>>;
  getDevicesForTenant(subscriptionId: string, params: PaginationParams): Promise<PaginatedResponse<Device>>;
  getAllDevices(): Promise<(DeviceWithTenant | UnregisteredDevice)[]>;
  addDevice(device: any): Promise<ItemResponse<any>>;
  updateDevice(device: any): Promise<ItemResponse<any>>;
  deleteDevice(id: string): Promise<ItemResponse<boolean>>;
  assignDeviceToTenant(deviceId: string, subscriptionId: string): Promise<ItemResponse<any>>;
}

export interface IBillingService {
  getBillingItems(params: PaginationParams): Promise<PaginatedResponse<Billing>>;
  getAllBillingItems(): Promise<Billing[]>;
  addBilling(billing: any): Promise<ItemResponse<any>>;
  updateBilling(billing: any): Promise<ItemResponse<any>>;
  deleteBilling(id: string): Promise<ItemResponse<boolean>>;
}

export interface IUserService {
  getUsersForTenant(subscriptionId: string, params: PaginationParams): Promise<PaginatedResponse<User>>;
  getAllUsers(): Promise<User[]>;
  addUser(user: any): Promise<ItemResponse<any>>;
  updateUser(user: any): Promise<ItemResponse<any>>;
  deleteUser(id: string): Promise<ItemResponse<boolean>>;
}

export interface ISubscriptionService {
  getSubscriptionById(id: string): Promise<ItemResponse<Subscription>>;
  getSubscriptions(params: PaginationParams): Promise<PaginatedResponse<Subscription>>;
  getAllSubscriptions(): Promise<Subscription[]>;
}
