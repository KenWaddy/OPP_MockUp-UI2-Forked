import { mockTenants } from '../mocks/index.js';

export class TenantService {
  /**
   * Get paginated list of tenants with filtering and sorting
   */
  getTenants(params) {
    let result = [...mockTenants];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'tenantName') {
            result = result.filter(tenant => 
              tenant.name.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'ownerName') {
            result = result.filter(tenant => 
              tenant.owner.name.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'mailAddress') {
            result = result.filter(tenant => 
              tenant.owner.email.toLowerCase().includes(String(value).toLowerCase())
            );
          } else {
            result = result.filter(tenant => 
              tenant[key] === value
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
            valueA = a[params.sort?.field] || '';
            valueB = b[params.sort?.field] || '';
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
  getTenantById(id, includeUsers = false, includeDevices = false, includeBilling = false) {
    const tenant = mockTenants.find(t => t.id === id);
    
    if (!tenant) {
      return {
        data: null,
        success: false,
        message: `Tenant with ID ${id} not found`
      };
    }
    
    const result = { ...tenant };
    
    if (!includeUsers) {
      delete result.users;
    }
    
    if (!includeDevices) {
      delete result.devices;
    }
    
    if (!includeBilling) {
      delete result.billingDetails;
    }
    
    return {
      data: result,
      success: true
    };
  }
}
