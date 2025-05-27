import { mockTenants, mockUnregisteredDevices } from '../mocks/index.js';
import { DeviceWithTenant, Device, UnregisteredDevice, Tenant } from '../types/models.js';
import { PaginationParams, PaginatedResponse, ItemResponse, IDeviceService } from './types.js';
import { delay } from '../utils/delay.js';
import { 
  devices, unregisteredDevices, tenants,
  addDevice as addDeviceToStore,
  updateDevice as updateDeviceInStore,
  deleteDevice as deleteDeviceFromStore,
  addUnregisteredDevice as addUnregisteredDeviceToStore,
  updateUnregisteredDevice as updateUnregisteredDeviceInStore,
  deleteUnregisteredDevice as deleteUnregisteredDeviceFromStore,
  assignDeviceToTenant as assignDeviceToTenantInStore,
  getNextDeviceIdForTenant
} from '../mocks/data/index.js';

export class DeviceService implements IDeviceService {
  /**
   * Get paginated devices with tenant information
   */
  async getDevices(params: PaginationParams): Promise<PaginatedResponse<DeviceWithTenant | UnregisteredDevice>> {
    await delay();
    
    // Create devices with tenant information
    const devicesWithTenantInfo: DeviceWithTenant[] = devices.map((device: Device) => {
      const tenant = tenants.find((t: Tenant) => t.id === device.subscriptionId);
      return {
        ...device,
        tenantId: device.subscriptionId, // Keep tenantId for DeviceWithTenant interface compatibility
        tenantName: tenant ? tenant.name : 'Unknown Tenant'
      };
    });
    
    let allDevices: (DeviceWithTenant | UnregisteredDevice)[] = [
      ...devicesWithTenantInfo,
      ...unregisteredDevices
    ];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'searchText') {
            const searchValue = String(value).toLowerCase();
            allDevices = allDevices.filter(device => 
              device.name.toLowerCase().includes(searchValue) ||
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
              (device as any)[key] === value
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
          valueA = (a as any)[params.sort!.field] || '';
          valueB = (b as any)[params.sort!.field] || '';
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
   * Get devices for a specific subscription with pagination
   */
  async getDevicesForTenant(subscriptionId: string, params: PaginationParams): Promise<PaginatedResponse<Device>> {
    await delay();
    
    const subscriptionDevices = devices.filter((device: Device) => device.subscriptionId === subscriptionId);
    
    if (subscriptionDevices.length === 0) {
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
    
    let filteredDevices = [...subscriptionDevices];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'name') {
            filteredDevices = filteredDevices.filter(device => 
              device.name.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'type') {
            filteredDevices = filteredDevices.filter(device => 
              device.type === value
            );
          } else if (key === 'status') {
            filteredDevices = filteredDevices.filter(device => 
              device.status === value
            );
          } else {
            filteredDevices = filteredDevices.filter(device => 
              device[key as keyof Device] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      filteredDevices.sort((a, b) => {
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
    
    const total = filteredDevices.length;
    const totalPages = Math.ceil(total / params.limit);
    
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = filteredDevices.slice(startIndex, endIndex);
    
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
   * Get all devices without pagination, filtering, or sorting
   * Used for data export and other bulk operations
   */
  async getAllDevices(): Promise<(DeviceWithTenant | UnregisteredDevice)[]> {
    await delay();
    
    // Create devices with tenant information
    const devicesWithTenantInfo: DeviceWithTenant[] = devices.map((device: Device) => {
      const tenant = tenants.find((t: Tenant) => t.id === device.subscriptionId);
      return {
        ...device,
        tenantId: device.subscriptionId, // Keep tenantId for DeviceWithTenant interface compatibility
        tenantName: tenant ? tenant.name : 'Unknown Tenant'
      };
    });
    
    const allDevices: (DeviceWithTenant | UnregisteredDevice)[] = [
      ...devicesWithTenantInfo,
      ...unregisteredDevices
    ];
    
    return allDevices;
  }

  /**
   * Add a new device
   */
  async addDevice(device: any): Promise<ItemResponse<any>> {
    await delay();
    
    try {
      const newDevice = {
        ...device,
        id: device.id || getNextDeviceIdForTenant(device.subscriptionId)
      };
      
      addDeviceToStore(newDevice);
      
      return {
        data: newDevice,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error adding device: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Update an existing device
   */
  async updateDevice(device: any): Promise<ItemResponse<any>> {
    await delay();
    
    try {
      const existingDevice = devices.find((d: Device) => d.id === device.id);
      
      if (!existingDevice) {
        return {
          data: null,
          success: false,
          message: `Device with ID ${device.id} not found`
        };
      }
      
      updateDeviceInStore(device);
      
      return {
        data: device,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error updating device: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Delete a device by ID
   */
  async deleteDevice(id: string): Promise<ItemResponse<boolean>> {
    await delay();
    
    try {
      const existingDevice = devices.find((d: Device) => d.id === id);
      
      if (!existingDevice) {
        return {
          data: false,
          success: false,
          message: `Device with ID ${id} not found`
        };
      }
      
      deleteDeviceFromStore(id);
      
      return {
        data: true,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: `Error deleting device: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Assign a device to a tenant
   */
  async assignDeviceToTenant(deviceId: string, subscriptionId: string): Promise<ItemResponse<any>> {
    await delay();
    
    try {
      const assignedDevice = assignDeviceToTenantInStore(deviceId, subscriptionId);
      
      if (!assignedDevice) {
        return {
          data: null,
          success: false,
          message: `Device with ID ${deviceId} not found or could not be assigned`
        };
      }
      
      return {
        data: assignedDevice,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error assigning device: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
