import { mockTenants } from '../mocks/index.js';
import { Tenant } from '../mocks/types.js';
import { PaginationParams, PaginatedResponse, ItemResponse, ITenantService } from './types.js';
import { delay } from '../utils/delay.js';
import { flatTenants, flatUsers, flatDevices, flatBilling } from '../mocks/data/index.js';
import { findOwnerForTenant } from './utils.js';

export class TenantService implements ITenantService {
  /**
   * Get paginated list of tenants with filtering and sorting
   */
  async getTenants(params: PaginationParams): Promise<PaginatedResponse<Tenant>> {
    await delay();
    
    let result = await Promise.all(flatTenants.map(async tenant => {
      const owner = findOwnerForTenant(tenant.id, flatUsers);
      
      return {
        ...tenant,
        owner: owner ? {
          name: owner.name,
          email: owner.email,
          phone: '',
          address: '',
          country: ''
        } : {
          name: 'No Owner Assigned',
          email: 'no-owner@example.com',
          phone: '',
          address: '',
          country: ''
        }
      };
    }));
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'textSearch') {
            const searchValue = String(value).toLowerCase();
            result = result.filter(tenant => 
              tenant.name.toLowerCase().includes(searchValue) ||
              tenant.owner.name.toLowerCase().includes(searchValue) ||
              tenant.owner.email.toLowerCase().includes(searchValue)
            );
          } else if (key === 'contract') {
            result = result.filter(tenant => tenant.contract === value);
          } else if (key === 'billing') {
            result = result.filter(tenant => tenant.billing === value);
          } else if (key === 'status') {
            result = result.filter(tenant => tenant.status === value);
          } else {
            result = result.filter(tenant => 
              (tenant as any)[key] === value
            );
          }
        }
      });
    }
    
    if (params.sort) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        switch (params.sort?.field) {
          case 'tenant':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'owner':
            valueA = a.owner.name;
            valueB = b.owner.name;
            break;
          case 'email':
            valueA = a.owner.email;
            valueB = b.owner.email;
            break;
          case 'contract':
            valueA = a.contract;
            valueB = b.contract;
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          case 'billing':
            valueA = a.billing;
            valueB = b.billing;
            break;
          default:
            const field = params.sort?.field || '';
            valueA = (a as any)[field] || '';
            valueB = (b as any)[field] || '';
        }
        
        if (valueA < valueB) {
          return params.sort?.order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return params.sort?.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    const total = result.length;
    const totalPages = Math.ceil(total / params.limit);
    
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = result.slice(startIndex, endIndex);
    
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
   * Get tenant by ID with optional related data
   */
  async getTenantById(id: string, includeUsers = false, includeDevices = false, includeBilling = false): Promise<ItemResponse<Tenant>> {
    await delay();
    
    const tenant = flatTenants.find((t) => t.id === id);
    
    if (!tenant) {
      return {
        data: null,
        success: false,
        message: `Tenant with ID ${id} not found`
      };
    }
    
    const owner = findOwnerForTenant(id, flatUsers);
    
    const result: any = {
      ...tenant,
      owner: owner ? {
        name: owner.name,
        email: owner.email,
        phone: '',
        address: '',
        country: ''
      } : {
        name: 'No Owner Assigned',
        email: 'no-owner@example.com',
        phone: '',
        address: '',
        country: ''
      }
    };
    
    if (includeUsers) {
      result.users = flatUsers.filter(user => user.tenantId === id);
    }
    
    if (includeDevices) {
      result.devices = flatDevices.filter(device => device.tenantId === id);
    }
    
    if (includeBilling) {
      result.billingDetails = flatBilling.filter(billing => billing.tenantId === id);
    }
    
    return {
      data: result,
      success: true
    };
  }
}
