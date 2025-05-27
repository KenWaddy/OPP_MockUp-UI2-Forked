import { TenantType } from '../commons/models.js';
import { PaginationParams, PaginatedResponse, ItemResponse, ITenantService } from './types.js';
import { delay } from './utils/delay.js';
import { 
  tenants, users, devices, billing, subscriptions,
  addTenant as addTenantToStore,
  updateTenant as updateTenantInStore,
  deleteTenant as deleteTenantFromStore,
  getNextTenantId
} from './FakerData/index.js';
import { 
  addSubscription as addSubscriptionToStore,
  getNextSubscriptionId
} from './FakerData/subscriptions.js';
import { findOwnerForTenant } from './utils.js';

export class TenantService implements ITenantService {
  /**
   * Get paginated list of tenants with filtering and sorting
   */
  async getTenants(params: PaginationParams): Promise<PaginatedResponse<TenantType>> {
    await delay();
    
    let result = await Promise.all(tenants.map(async (tenant: any) => {
      const contact = {
        first_name: tenant.contact_person_first_name,
        last_name: tenant.contact_person_last_name,
        department: tenant.contact_department,
        language: tenant.language,
        email: tenant.contact_person_email,
        phone_office: tenant.contact_phone_office,
        phone_mobile: tenant.contact_phone_mobile,
        company: tenant.contact_company,
        address1: tenant.contact_address1,
        address2: tenant.contact_address2,
        city: tenant.contact_city,
        state_prefecture: tenant.contact_state_prefecture,
        country: tenant.contact_country,
        postal_code: tenant.contact_postal_code
      };
      
      return {
        id: tenant.id,
        name: tenant.name,
        description: tenant.description,
        contact,
        subscriptionId: tenant.subscriptionId
      };
    }));
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'textSearch') {
            const searchValue = String(value).toLowerCase();
            result = result.filter(tenant => 
              tenant.name.toLowerCase().includes(searchValue) ||
              tenant.contact.first_name.toLowerCase().includes(searchValue) ||
              tenant.contact.last_name.toLowerCase().includes(searchValue) ||
              tenant.contact.email.toLowerCase().includes(searchValue)
            );
          } else if (key === 'contractType') {
            result = result.filter(tenant => {
              const subscription = subscriptions.find((sub: any) => sub.id === tenant.subscriptionId);
              return subscription && subscription.type === value;
            });
          } else if (key === 'status') {
            result = result.filter(tenant => {
              const subscription = subscriptions.find((sub: any) => sub.id === tenant.subscriptionId);
              return subscription && subscription.status === value;
            });
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
          case 'contact':
            valueA = a.contact.last_name;
            valueB = b.contact.last_name;
            break;
          case 'email':
            valueA = a.contact.email;
            valueB = b.contact.email;
            break;
          case 'type':
          case 'status':
            valueA = '';
            valueB = '';
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
  async getTenantById(id: string, includeUsers = false, includeDevices = false, includeBilling = false): Promise<ItemResponse<TenantType>> {
    await delay();
    
    const tenant = tenants.find((t: any) => t.id === id);
    
    if (!tenant) {
      return {
        data: null,
        success: false,
        message: `Tenant with ID ${id} not found`
      };
    }
    
    const contact = {
      first_name: tenant.contact_person_first_name,
      last_name: tenant.contact_person_last_name,
      department: tenant.contact_department,
      language: tenant.language,
      email: tenant.contact_person_email,
      phone_office: tenant.contact_phone_office,
      phone_mobile: tenant.contact_phone_mobile,
      company: tenant.contact_company,
      address1: tenant.contact_address1,
      address2: tenant.contact_address2,
      city: tenant.contact_city,
      state_prefecture: tenant.contact_state_prefecture,
      country: tenant.contact_country,
      postal_code: tenant.contact_postal_code
    };
    
    const result: any = {
      id: tenant.id,
      name: tenant.name,
      description: tenant.description,
      contact,
      subscriptionId: tenant.subscriptionId
    };
    
    if (includeUsers) {
      result.users = users.filter((user: any) => user.subscriptionId === id);
    }
    
    if (includeDevices) {
      result.devices = devices.filter((device: any) => device.subscriptionId === id);
    }
    
    if (includeBilling) {
      result.billingDetails = billing.filter((billing: any) => billing.subscriptionId === id);
    }
    
    return {
      data: result,
      success: true
    };
  }

  /**
   * Get all tenants without pagination, filtering, or sorting
   * Used for data export and other bulk operations
   */
  async getAllTenants(): Promise<TenantType[]> {
    await delay();
    
    const result = await Promise.all(tenants.map(async (tenant: any) => {
      const contact = {
        first_name: tenant.contact_person_first_name,
        last_name: tenant.contact_person_last_name,
        department: tenant.contact_department,
        language: tenant.language,
        email: tenant.contact_person_email,
        phone_office: tenant.contact_phone_office,
        phone_mobile: tenant.contact_phone_mobile,
        company: tenant.contact_company,
        address1: tenant.contact_address1,
        address2: tenant.contact_address2,
        city: tenant.contact_city,
        state_prefecture: tenant.contact_state_prefecture,
        country: tenant.contact_country,
        postal_code: tenant.contact_postal_code
      };
      
      return {
        id: tenant.id,
        name: tenant.name,
        description: tenant.description,
        contact,
        subscriptionId: tenant.subscriptionId
      };
    }));
    
    return result;
  }

  /**
   * Add a new tenant with subscription
   */
  async addTenant(tenant: any, subscription: any): Promise<ItemResponse<TenantType>> {
    await delay();
    
    try {
      addSubscriptionToStore(subscription);
      
      const newTenant = {
        id: tenant.id || getNextTenantId(),
        name: tenant.name,
        description: tenant.description,
        contact_person_first_name: tenant.contact.first_name,
        contact_person_last_name: tenant.contact.last_name,
        contact_department: tenant.contact.department,
        language: tenant.contact.language,
        contact_person_email: tenant.contact.email,
        contact_phone_office: tenant.contact.phone_office,
        contact_phone_mobile: tenant.contact.phone_mobile,
        contact_company: tenant.contact.company,
        contact_address1: tenant.contact.address1,
        contact_address2: tenant.contact.address2,
        contact_city: tenant.contact.city,
        contact_state_prefecture: tenant.contact.state_prefecture,
        contact_country: tenant.contact.country,
        contact_postal_code: tenant.contact.postal_code,
        subscriptionId: subscription.id
      };
      
      addTenantToStore(newTenant);
      
      return {
        data: {
          id: newTenant.id,
          name: newTenant.name,
          description: newTenant.description,
          contact: {
            first_name: newTenant.contact_person_first_name,
            last_name: newTenant.contact_person_last_name,
            department: newTenant.contact_department,
            language: newTenant.language,
            email: newTenant.contact_person_email,
            phone_office: newTenant.contact_phone_office,
            phone_mobile: newTenant.contact_phone_mobile,
            company: newTenant.contact_company,
            address1: newTenant.contact_address1,
            address2: newTenant.contact_address2,
            city: newTenant.contact_city,
            state_prefecture: newTenant.contact_state_prefecture,
            country: newTenant.contact_country,
            postal_code: newTenant.contact_postal_code
          },
          subscriptionId: newTenant.subscriptionId
        },
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error adding tenant: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Update an existing tenant
   */
  async updateTenant(tenant: any): Promise<ItemResponse<TenantType>> {
    await delay();
    
    try {
      const existingTenant = tenants.find((t: any) => t.id === tenant.id);
      
      if (!existingTenant) {
        return {
          data: null,
          success: false,
          message: `Tenant with ID ${tenant.id} not found`
        };
      }
      
      const updatedTenant = {
        ...existingTenant,
        name: tenant.name,
        description: tenant.description,
        contact_person_first_name: tenant.contact.first_name,
        contact_person_last_name: tenant.contact.last_name,
        contact_department: tenant.contact.department,
        language: tenant.contact.language,
        contact_person_email: tenant.contact.email,
        contact_phone_office: tenant.contact.phone_office,
        contact_phone_mobile: tenant.contact.phone_mobile,
        contact_company: tenant.contact.company,
        contact_address1: tenant.contact.address1,
        contact_address2: tenant.contact.address2,
        contact_city: tenant.contact.city,
        contact_state_prefecture: tenant.contact.state_prefecture,
        contact_country: tenant.contact.country,
        contact_postal_code: tenant.contact.postal_code
      };
      
      updateTenantInStore(updatedTenant);
      
      return {
        data: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          description: updatedTenant.description,
          contact: {
            first_name: updatedTenant.contact_person_first_name,
            last_name: updatedTenant.contact_person_last_name,
            department: updatedTenant.contact_department,
            language: updatedTenant.language,
            email: updatedTenant.contact_person_email,
            phone_office: updatedTenant.contact_phone_office,
            phone_mobile: updatedTenant.contact_phone_mobile,
            company: updatedTenant.contact_company,
            address1: updatedTenant.contact_address1,
            address2: updatedTenant.contact_address2,
            city: updatedTenant.contact_city,
            state_prefecture: updatedTenant.contact_state_prefecture,
            country: updatedTenant.contact_country,
            postal_code: updatedTenant.contact_postal_code
          },
          subscriptionId: updatedTenant.subscriptionId
        },
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Error updating tenant: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Delete a tenant by ID
   */
  async deleteTenant(id: string): Promise<ItemResponse<boolean>> {
    await delay();
    
    try {
      const existingTenant = tenants.find((t: any) => t.id === id);
      
      if (!existingTenant) {
        return {
          data: false,
          success: false,
          message: `Tenant with ID ${id} not found`
        };
      }
      
      deleteTenantFromStore(id);
      
      return {
        data: true,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: `Error deleting tenant: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
