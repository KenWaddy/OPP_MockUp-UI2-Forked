import { faker } from '@faker-js/faker';
import { FlatTenant } from './types.js';

/**
 * Generate a list of flat tenant objects
 * @param count Number of tenants to generate
 * @returns Array of flat tenant objects
 */
export function generateTenants(count: number = 100): FlatTenant[] {
  const tenants: FlatTenant[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `tenant-${i + 1}`;
    
    tenants.push({
      id,
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      contract: faker.helpers.arrayElement(['Evergreen', 'Fixed-term', 'Trial']),
      status: faker.helpers.arrayElement(['Active', 'Inactive', 'Pending', 'Suspended']),
      billing: faker.helpers.arrayElement(['Monthly', 'Annually', 'One-time']),
      subscription: {
        name: faker.helpers.arrayElement(['Basic', 'Standard', 'Premium', 'Enterprise']),
        id: `sub-${faker.string.alphanumeric(8)}`,
        description: faker.lorem.sentence(),
        services: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => 
          faker.helpers.arrayElement(['Storage', 'Compute', 'Analytics', 'Security', 'Support', 'Backup'])
        ),
        termType: faker.helpers.arrayElement(['Monthly', 'Annually', 'Perpetual']),
        status: faker.helpers.arrayElement(['Active', 'Pending', 'Expired']),
        startDate: faker.date.past().toISOString().split('T')[0],
        endDate: faker.date.future().toISOString().split('T')[0],
        configs: faker.lorem.paragraph()
      }
    });
  }
  
  return tenants;
}

export const flatTenants = generateTenants(100);
