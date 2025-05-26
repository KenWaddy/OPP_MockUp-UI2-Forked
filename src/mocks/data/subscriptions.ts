import { faker } from '@faker-js/faker';
import { FlatSubscription } from './types.js';

/**
 * Generate a list of subscriptions
 * @param count Number of subscriptions to generate
 * @returns Array of flat subscription objects
 */
export function generateSubscriptions(count: number = 100): FlatSubscription[] {
  const subscriptions: FlatSubscription[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(['Evergreen', 'Termed']);
    const status = faker.helpers.arrayElement(['Active', 'Cancelled']);
    const startDate = faker.date.past({ years: 2 });
    const endDate = type === 'Termed' ? faker.date.future({ years: 1, refDate: startDate }) : null;
    
    subscriptions.push({
      id: `sub-${i}`,
      name: faker.helpers.arrayElement(['Enterprise Plan', 'Standard Plan', 'Basic Plan', 'Premium Plan']),
      description: faker.lorem.sentence(),
      type,
      status,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      enabled_app_DMS: faker.datatype.boolean(),
      enabled_app_eVMS: faker.datatype.boolean(),
      enabled_app_CVR: faker.datatype.boolean(),
      enabled_app_AIAMS: faker.datatype.boolean(),
      config_SSH_terminal: faker.datatype.boolean(),
      config_AIAPP_installer: faker.datatype.boolean(),
    });
  }
  
  return subscriptions;
}

export const flatSubscriptions = generateSubscriptions(100);
