import { faker } from '@faker-js/faker';
import { Billing } from '../../types/models.js';
import { tenants } from './tenants.js';
import { devices } from './devices.js';

/**
 * Generate billing records for a specific subscription
 * @param subscriptionId ID of the subscription to generate billing for
 * @param count Number of billing records to generate
 * @returns Array of billing objects
 */
export function generateBillingForTenant(subscriptionId: string, count: number): Billing[] {
  const billingRecords: Billing[] = [];
  
  const subscriptionDevices = devices.filter(device => device.subscriptionId === subscriptionId);
  
  const devicesByType: Record<string, number> = {};
  subscriptionDevices.forEach(device => {
    devicesByType[device.type] = (devicesByType[device.type] || 0) + 1;
  });
  
  for (let i = 0; i < count; i++) {
    const paymentType = faker.helpers.arrayElement(["One-time", "Monthly", "Annually"]);
    const startDate = faker.date.past().toISOString().split('T')[0];
    const endDate = faker.date.future().toISOString().split('T')[0];
    
    const deviceContract = Object.entries(devicesByType).map(([type, count]) => ({
      type: type as Billing["deviceContract"][0]["type"],
      quantity: count
    }));
    
    deviceContract.forEach(contract => {
      const adjustment = faker.number.int({ min: -20, max: 20 }) / 100;
      contract.quantity = Math.max(1, Math.round(contract.quantity * (1 + adjustment)));
    });
    
    const billing: Billing = {
      id: `billing-${subscriptionId}-${i}`,
      subscriptionId,
      deviceContract,
      startDate,
      endDate,
      paymentType
    };
    
    if (paymentType === "One-time") {
      billing.billingDate = startDate;
    } else if (paymentType === "Annually") {
      billing.dueMonth = faker.number.int({ min: 1, max: 12 });
    }
    
    billingRecords.push(billing);
  }
  
  return billingRecords;
}

/**
 * Generate all billing records for all tenants
 * @returns Array of all billing objects
 */
export function generateAllBilling(): Billing[] {
  const allBilling: Billing[] = [];
  
  tenants.forEach(tenant => {
    const billingCount = faker.number.int({ min: 1, max: 3 });
    const tenantBilling = generateBillingForTenant(tenant.id, billingCount);
    allBilling.push(...tenantBilling);
  });
  
  return allBilling;
}

export const billing = generateAllBilling();
