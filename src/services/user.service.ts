import { mockTenants } from '../mocks/index.js';
import { User } from '../mocks/types.js';
import { PaginationParams, PaginatedResponse, ItemResponse } from './types.js';

export class UserService {
  /**
   * Get paginated users for a specific tenant
   */
  getUsersForTenant(tenantId: string, params: PaginationParams): PaginatedResponse<User> {
    const tenant = mockTenants.find(t => t.id === tenantId);
    
    if (!tenant || !tenant.users) {
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
    
    let result = [...tenant.users];
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'name') {
            result = result.filter(user => 
              user.name.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'email') {
            result = result.filter(user => 
              user.email.toLowerCase().includes(String(value).toLowerCase())
            );
          } else if (key === 'role') {
            result = result.filter(user => 
              user.roles.includes(value as "Owner" | "Engineer" | "Member")
            );
          }
        }
      });
    }
    
    if (params.sort) {
      result.sort((a, b) => {
        let valueA = a[params.sort?.field as keyof User] || '';
        let valueB = b[params.sort?.field as keyof User] || '';
        
        if (params.sort?.field === 'roles' && Array.isArray(valueA) && Array.isArray(valueB)) {
          valueA = valueA.join(',');
          valueB = valueB.join(',');
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
}
