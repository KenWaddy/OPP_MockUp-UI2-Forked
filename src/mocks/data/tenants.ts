import { faker } from '@faker-js/faker';
import { FlatTenant } from './types.js';
import { flatSubscriptions } from './subscriptions.js';

/**
 * Generate a list of flat tenant objects
 * @param count Number of tenants to generate
 * @returns Array of flat tenant objects
 */
export function generateTenants(count: number = 100): FlatTenant[] {
  const tenants: FlatTenant[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `tenant-${i + 1}`;
    const language = faker.helpers.arrayElement(['日本語', 'English']);
    const subscription = faker.helpers.arrayElement(flatSubscriptions);
    
    tenants.push({
      id,
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      contact_person_first_name: faker.person.firstName(),
      contact_person_last_name: faker.person.lastName(),
      contact_department: faker.commerce.department(),
      language,
      contact_person_email: faker.internet.email(),
      contact_phone_office: faker.phone.number(),
      contact_phone_mobile: faker.phone.number(),
      contact_company: faker.company.name(),
      contact_address1: faker.location.streetAddress(),
      contact_address2: faker.location.secondaryAddress(),
      contact_city: faker.location.city(),
      contact_state_prefecture: faker.location.state(),
      contact_country: faker.location.country(),
      contact_postal_code: faker.location.zipCode(),
      corresponding_subscription_id: subscription.id
    });
  }
  
  return tenants;
}

export const flatTenants = generateTenants(100);
