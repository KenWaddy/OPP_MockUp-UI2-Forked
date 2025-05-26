import { mockTenants } from '../mocks/index.js';
import { TenantType } from '../mocks/types.js';
import { PaginationParams, PaginatedResponse, ItemResponse, ITenantService } from './types.js';
import { delay } from '../utils/delay.js';
import { tenants, users, devices, billing, subscriptions } from '../mocks/data/index.js';
import { findOwnerForTenant } from './utils.js';

export class TenantService implements ITenantService {
  /**
   * Get paginated list of tenants with filtering and sorting
   */
  async getTenants(params: PaginationParams): Promise<PaginatedResponse<TenantType>> {
    await delay();
    
    let result = await Promise.all(tenants.map(async (tenant: any) => {
      const subscription = subscriptions.find((sub: any) => sub.id === tenant.subscriptionId);
      
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
        subscriptionId: tenant.subscriptionId,
        subscription: subscription ? {
          id: subscription.id,
          name: subscription.name,
          description: subscription.description,
          type: subscription.type,
          status: subscription.status,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          enabled_app_DMS: subscription.enabled_app_DMS,
          enabled_app_eVMS: subscription.enabled_app_eVMS,
          enabled_app_CVR: subscription.enabled_app_CVR,
          enabled_app_AIAMS: subscription.enabled_app_AIAMS,
          config_SSH_terminal: subscription.config_SSH_terminal,
          config_AIAPP_installer: subscription.config_AIAPP_installer
        } : undefined
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
          } else if (key === 'type') {
            result = result.filter(tenant => tenant.subscription?.type === value);
          } else if (key === 'status') {
            result = result.filter(tenant => tenant.subscription?.status === value);
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
            valueA = a.subscription?.type || '';
            valueB = b.subscription?.type || '';
            break;
          case 'status':
            valueA = a.subscription?.status || '';
            valueB = b.subscription?.status || '';
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
    
    const subscription = subscriptions.find((sub: any) => sub.id === tenant.subscriptionId);
    
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
      subscriptionId: tenant.subscriptionId,
      subscription: subscription ? {
        id: subscription.id,
        name: subscription.name,
        description: subscription.description,
        type: subscription.type,
        status: subscription.status,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        enabled_app_DMS: subscription.enabled_app_DMS,
        enabled_app_eVMS: subscription.enabled_app_eVMS,
        enabled_app_CVR: subscription.enabled_app_CVR,
        enabled_app_AIAMS: subscription.enabled_app_AIAMS,
        config_SSH_terminal: subscription.config_SSH_terminal,
        config_AIAPP_installer: subscription.config_AIAPP_installer
      } : undefined
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
      const subscription = subscriptions.find((sub: any) => sub.id === tenant.subscriptionId);
      
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
        subscriptionId: tenant.subscriptionId,
        subscription: subscription ? {
          id: subscription.id,
          name: subscription.name,
          description: subscription.description,
          type: subscription.type,
          status: subscription.status,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          enabled_app_DMS: subscription.enabled_app_DMS,
          enabled_app_eVMS: subscription.enabled_app_eVMS,
          enabled_app_CVR: subscription.enabled_app_CVR,
          enabled_app_AIAMS: subscription.enabled_app_AIAMS,
          config_SSH_terminal: subscription.config_SSH_terminal,
          config_AIAPP_installer: subscription.config_AIAPP_installer
        } : undefined
      };
    }));
    
    return result;
  }
}
