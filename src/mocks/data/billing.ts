import { faker } from '@faker-js/faker';
import { FlatBilling } from './types.js';
import { flatTenants } from './tenants.js';
import { flatDevices } from './devices.js';

/**
 * Generate billing records for a specific tenant
 * @param tenantId ID of the tenant to generate billing for
 * @param count Number of billing records to generate
 * @returns Array of flat billing objects
 */
export function generateBillingForTenant(tenantId: string, count: number): FlatBilling[] {
  const billingRecords: FlatBilling[] = [];
  
  const tenantDevices = flatDevices.filter(device => device.tenantId === tenantId);
  
  const devicesByType: Record<string, number> = {};
  tenantDevices.forEach(device => {
    devicesByType[device.type] = (devicesByType[device.type] || 0) + 1;
  });
  
  for (let i = 0; i < count; i++) {
    const paymentType = faker.helpers.arrayElement(["One-time", "Monthly", "Annually"]);
    const startDate = faker.date.past().toISOString().split('T')[0];
    const endDate = faker.date.future().toISOString().split('T')[0];
    
    const deviceContract = Object.entries(devicesByType).map(([type, count]) => ({
      type: type as FlatBilling["deviceContract"][0]["type"],
      quantity: count
    }));
    
    deviceContract.forEach(contract => {
      const adjustment = faker.number.int({ min: -20, max: 20 }) / 100;
      contract.quantity = Math.max(1, Math.round(contract.quantity * (1 + adjustment)));
    });
    
    const billing: FlatBilling = {
      id: `billing-${tenantId}-${i}`,
      tenantId,
      billingId: `BID-${faker.string.alphanumeric(8).toUpperCase()}`,
      deviceContract,
      startDate,
      endDate,
      paymentType,
      billingStartDate: startDate
    };
    
    if (paymentType === "One-time") {
      billing.billingDate = startDate;
    } else if (paymentType === "Monthly") {
      billing.dueDay = faker.helpers.arrayElement([1, 5, 10, 15, 20, 25, "End of Month"]);
    } else if (paymentType === "Annually") {
      billing.dueDay = faker.helpers.arrayElement([1, 15]);
      billing.dueMonth = faker.number.int({ min: 1, max: 12 });
    }
    
    billingRecords.push(billing);
  }
  
  return billingRecords;
}

/**
 * Generate all billing records for all tenants
 * @returns Array of all flat billing objects
 */
export function generateAllBilling(): FlatBilling[] {
  const allBilling: FlatBilling[] = [];
  
  flatTenants.forEach(tenant => {
    const billingCount = faker.number.int({ min: 1, max: 3 });
    const tenantBilling = generateBillingForTenant(tenant.id, billingCount);
    allBilling.push(...tenantBilling);
  });
  
  return allBilling;
}

export const flatBilling = generateAllBilling();
