import { User } from '../commons/models.js';
import i18n from '../languages/i18n';

/**
 * Format contact name based on language preference
 * @param firstName First name
 * @param lastName Last name
 * @param language Language preference ('日本語' or 'English')
 * @returns Formatted name string
 */
export function formatContactName(firstName: string, lastName: string, language: '日本語' | 'English'): string {
  return language === '日本語' ? `${lastName} ${firstName}` : `${firstName} ${lastName}`;
}

/**
 * Find the owner user for a tenant
 * @param subscriptionId ID of the subscription
 * @param users Array of users to search
 * @returns Owner user or undefined if not found
 */
export function findOwnerForTenant(subscriptionId: string, users: User[]): User | undefined {
  const tenantOwners = users.filter(user => 
    user.subscriptionId === subscriptionId && user.roles.includes('Owner')
  );
  
  return tenantOwners.length > 0 ? tenantOwners[0] : undefined;
}
