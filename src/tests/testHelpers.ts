import { tenants, users } from '../mockAPI/FakerData/index.js';
import { Tenant, User } from '../commons/models.js';

/**
 * Set up test data for edge cases
 */
export function setupTestData() {
  const noOwnerTenant: Tenant = {
    id: 'no-owner-tenant-id',
    name: 'Tenant Without Owner',
    description: 'This tenant has no user with Owner role',
    contact_person_first_name: '',
    contact_person_last_name: '',
    contact_department: '',
    language: 'English',
    contact_person_email: '',
    contact_phone_office: '',
    contact_phone_mobile: '',
    contact_company: '',
    contact_address1: '',
    contact_address2: '',
    contact_city: '',
    contact_state_prefecture: '',
    contact_country: '',
    contact_postal_code: '',
    subscriptionId: 'no-owner-subscription-id'
  };
  
  if (!tenants.find((t: Tenant) => t.id === noOwnerTenant.id)) {
    tenants.push(noOwnerTenant);
  }
  
  const usersToRemove = users.filter((user: User) => 
    user.subscriptionId === noOwnerTenant.subscriptionId && user.roles.includes('Owner')
  );
  
  for (const user of usersToRemove) {
    const index = users.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      users.splice(index, 1);
    }
  }
}
