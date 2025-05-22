import { FlatUser } from '../mocks/data/types.js';

/**
 * Find the owner user for a tenant
 * @param tenantId ID of the tenant
 * @param users Array of users to search
 * @returns Owner user or undefined if not found
 */
export function findOwnerForTenant(tenantId: string, users: FlatUser[]): FlatUser | undefined {
  const tenantOwners = users.filter(user => 
    user.tenantId === tenantId && user.roles.includes('Owner')
  );
  
  return tenantOwners.length > 0 ? tenantOwners[0] : undefined;
}
