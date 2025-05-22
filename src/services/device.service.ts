import { mockTenants, mockUnregisteredDevices } from '../mocks/index.js';
import { Device, DeviceWithTenant, UnregisteredDevice } from '../mocks/types.js';
import { PaginationParams, PaginatedResponse, ItemResponse } from './types.js';
import { delay } from '../utils/delay.js';
import { flatDevices, flatUnregisteredDevices, flatTenants } from '../mocks/data/index.js';

export class DeviceService {
  /**
   * Get paginated devices with tenant information
   */
  async getDevices(params: PaginationParams): Promise<PaginatedResponse<DeviceWithTenant | UnregisteredDevice>> {
    await delay();
    
    // Create devices with tenant information
    const devicesWithTenantInfo: DeviceWithTenant[] = flatDevices.map(device => {
      const tenant = flatTenants.find(t => t.id === device.tenantId);
      return {
        ...device,
        tenantId: device.tenantId,
        tenantName: tenant ? tenant.name : 'Unknown Tenant'
      };
    });
    
    let allDevices: (DeviceWithTenant | UnregisteredDevice)[] = [
      ...devicesWithTenantInfo,
      ...flatUnregisteredDevices
    ];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'searchText') {
            const searchValue = String(value).toLowerCase();
            allDevices = allDevices.filter(device => 
              device.name.toLowerCase().includes(searchValue) ||
              device.deviceId.toLowerCase().includes(searchValue) ||
              device.serialNo.toLowerCase().includes(searchValue) ||
              device.description.toLowerCase().includes(searchValue) ||
              ('tenantName' in device && device.tenantName.toLowerCase().includes(searchValue))
            );
          } else if (key === 'type') {
            allDevices = allDevices.filter(device => 
              device.type === value
            );
          } else if (key === 'status') {
            allDevices = allDevices.filter(device => 
              device.status === value
            );
          } else if (key === 'tenantId') {
            allDevices = allDevices.filter(device => 
              'tenantId' in device && device.tenantId === value
            );
          } else if (key === 'isUnregistered') {
            allDevices = allDevices.filter(device => 
              'isUnregistered' in device && device.isUnregistered === value
            );
          } else {
            allDevices = allDevices.filter(device => 
              device[key as keyof Device] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      allDevices.sort((a, b) => {
        let valueA: any = '';
        let valueB: any = '';
        
        if (params.sort!.field === 'tenantName') {
          valueA = 'tenantName' in a ? a.tenantName : '';
          valueB = 'tenantName' in b ? b.tenantName : '';
        } else {
          valueA = a[params.sort!.field as keyof Device] || '';
          valueB = b[params.sort!.field as keyof Device] || '';
        }
        
        if (valueA < valueB) {
          return params.sort!.order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return params.sort!.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    const total = allDevices.length;
    const totalPages = Math.ceil(total / params.limit);
    
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = allDevices.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages
      }
    };
  }

  /**
   * Get devices for a specific tenant with pagination
   */
  async getDevicesForTenant(tenantId: string, params: PaginationParams): Promise<PaginatedResponse<Device>> {
    await delay();
    
    const tenantDevices = flatDevices.filter(device => device.tenantId === tenantId);
    
    if (tenantDevices.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0
        }
      };
    }
    
    let devices = [...tenantDevices];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'name') {
            devices = devices.filter(device => 
              device.name.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'type') {
            devices = devices.filter(device => 
              device.type === value
            );
          } else if (key === 'status') {
            devices = devices.filter(device => 
              device.status === value
            );
          } else {
            devices = devices.filter(device => 
              device[key as keyof Device] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      devices.sort((a, b) => {
        const valueA = a[params.sort!.field as keyof Device] || '';
        const valueB = b[params.sort!.field as keyof Device] || '';
        
        if (valueA < valueB) {
          return params.sort!.order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return params.sort!.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    const total = devices.length;
    const totalPages = Math.ceil(total / params.limit);
    
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = devices.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages
      }
    };
  }
}
