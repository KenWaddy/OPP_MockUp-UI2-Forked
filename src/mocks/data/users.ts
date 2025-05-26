import { faker } from '@faker-js/faker';
import { User } from '../../types/models.js';
import { tenants } from './tenants.js';

/**
 * Generate a list of users for a specific subscription
 * @param subscriptionId ID of the subscription to generate users for
 * @param count Number of users to generate
 * @returns Array of user objects
 */
export function generateUsersForTenant(subscriptionId: string, count: number): User[] {
  const users: User[] = [];
  
  users.push({
    id: `user-${subscriptionId}-owner`,
    subscriptionId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    roles: ["Owner"],
    ipWhitelist: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
      faker.internet.ipv4()
    ),
    mfaEnabled: faker.datatype.boolean(0.8) // 80% chance of MFA being enabled
  });
  
  for (let i = 1; i < count; i++) {
    const roles: ("Engineer" | "Member")[] = []; // Remove "Owner" from possible roles
    
    if (faker.datatype.boolean(0.4)) {
      roles.push("Engineer");
    }
    
    if (roles.length === 0 || faker.datatype.boolean(0.7)) {
      roles.push("Member");
    }
    
    users.push({
      id: `user-${subscriptionId}-${i}`,
      subscriptionId,
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
 * @returns Array of all user objects
 */
export function generateAllUsers(): User[] {
  const allUsers: User[] = [];
  
  tenants.forEach(tenant => {
    const userCount = faker.number.int({ min: 5, max: 20 });
    const tenantUsers = generateUsersForTenant(tenant.id, userCount);
    allUsers.push(...tenantUsers);
  });
  
  return allUsers;
}

export const users = generateAllUsers();
