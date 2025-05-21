import { faker } from '@faker-js/faker';
import { FlatUser } from './types.js';
import { flatTenants } from './tenants.js';

/**
 * Generate a list of users for a specific tenant
 * @param tenantId ID of the tenant to generate users for
 * @param count Number of users to generate
 * @returns Array of flat user objects
 */
export function generateUsersForTenant(tenantId: string, count: number): FlatUser[] {
  const users: FlatUser[] = [];
  
  users.push({
    id: `user-${tenantId}-owner`,
    tenantId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    roles: ["Owner"],
    ipWhitelist: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
      faker.internet.ipv4()
    ),
    mfaEnabled: faker.datatype.boolean(0.8) // 80% chance of MFA being enabled
  });
  
  for (let i = 1; i < count; i++) {
    const roles: ("Owner" | "Engineer" | "Member")[] = [];
    
    if (i < 3 && faker.datatype.boolean(0.3)) {
      roles.push("Owner");
    }
    
    if (faker.datatype.boolean(0.4)) {
      roles.push("Engineer");
    }
    
    if (roles.length === 0 || faker.datatype.boolean(0.7)) {
      roles.push("Member");
    }
    
    users.push({
      id: `user-${tenantId}-${i}`,
      tenantId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      roles,
      ipWhitelist: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => 
        faker.internet.ipv4()
      ),
      mfaEnabled: faker.datatype.boolean(0.6) // 60% chance of MFA being enabled
    });
  }
  
  return users;
}

/**
 * Generate all users for all tenants
 * @returns Array of all flat user objects
 */
export function generateAllUsers(): FlatUser[] {
  const allUsers: FlatUser[] = [];
  
  flatTenants.forEach(tenant => {
    const userCount = faker.number.int({ min: 5, max: 20 });
    const tenantUsers = generateUsersForTenant(tenant.id, userCount);
    allUsers.push(...tenantUsers);
  });
  
  return allUsers;
}

export const flatUsers = generateAllUsers();
