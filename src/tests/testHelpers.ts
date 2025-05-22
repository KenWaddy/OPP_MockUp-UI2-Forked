import { flatTenants, flatUsers } from '../mocks/data/index.js';
import { FlatTenant } from '../mocks/data/types.js';

/**
 * Set up test data for edge cases
 */
export function setupTestData() {
  const noOwnerTenant: FlatTenant = {
    id: 'no-owner-tenant-id',
    name: 'Tenant Without Owner',
    description: 'This tenant has no user with Owner role',
    contract: 'Trial',
    status: 'Active',
    billing: 'Monthly'
  };
  
  if (!flatTenants.find(t => t.id === noOwnerTenant.id)) {
    flatTenants.push(noOwnerTenant);
  }
  
  const usersToRemove = flatUsers.filter(user => 
    user.tenantId === noOwnerTenant.id && user.roles.includes('Owner')
  );
  
  for (const user of usersToRemove) {
    const index = flatUsers.findIndex(u => u.id === user.id);
    if (index !== -1) {
      flatUsers.splice(index, 1);
    }
  }
}
