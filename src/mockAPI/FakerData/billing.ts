import { faker } from '@faker-js/faker';
import { Billing, Device } from '../../commons/models.js';
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
  
  const devicesByType: Record<string, Device[]> = {};
  subscriptionDevices.forEach(device => {
    if (!devicesByType[device.type]) {
      devicesByType[device.type] = [];
    }
    devicesByType[device.type].push(device);
  });
  
  const deviceCountsByType: Record<string, number> = {};
  Object.entries(devicesByType).forEach(([type, devices]) => {
    deviceCountsByType[type] = devices.length;
  });
  
  for (let i = 0; i < count; i++) {
    const paymentType = faker.helpers.arrayElement(["One-time", "Monthly", "Annually"]);
    
    let startDate, endDate;
    if (faker.datatype.boolean(0.3)) {
      endDate = faker.date.past().toISOString().split('T')[0];
      startDate = faker.date.past({ refDate: endDate }).toISOString().split('T')[0];
    } else {
      startDate = faker.date.past().toISOString().split('T')[0];
      endDate = faker.date.future().toISOString().split('T')[0];
    }
    
    let deviceContract: Billing["deviceContract"];
    let deviceIds: { [deviceType: string]: string[] };
    
    if (i > 0 && faker.datatype.boolean(0.2)) {
      const previousContract = billingRecords[billingRecords.length - 1];
      deviceContract = [...previousContract.deviceContract];
      deviceIds = { ...previousContract.deviceIds };
    } else {
      deviceContract = Object.entries(deviceCountsByType).map(([type, count]) => ({
        type: type as Billing["deviceContract"][0]["type"],
        quantity: count
      }));
      
      deviceContract.forEach(contract => {
        const adjustment = faker.number.int({ min: -20, max: 20 }) / 100;
        contract.quantity = Math.max(1, Math.round(contract.quantity * (1 + adjustment)));
      });
      
      deviceIds = {};
      Object.entries(devicesByType).forEach(([type, typeDevices]) => {
        deviceIds[type] = typeDevices.map(device => device.id);
      });
    }
    
    const isOld: boolean = endDate ? new Date(endDate) < new Date() : false;
    
    const billing: Billing = {
      id: faker.string.uuid(),
      billingManageNo: `AMOR-${String(i + 1).padStart(3, '0')}`,
      subscriptionId,
      deviceContract,
      deviceIds,
      startDate,
      endDate,
      paymentType,
      isOld
    };
    
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

let mutableBilling = generateAllBilling();

export const getBilling = () => mutableBilling;
export const addBilling = (billingRecord: Billing) => {
  mutableBilling.push(billingRecord);
};
export const updateBilling = (updatedBilling: Billing) => {
  const index = mutableBilling.findIndex(b => b.id === updatedBilling.id);
  if (index !== -1) {
    mutableBilling[index] = updatedBilling;
  }
};
export const deleteBilling = (id: string) => {
  mutableBilling = mutableBilling.filter(b => b.id !== id);
};
export const getNextBillingIdForTenant = (subscriptionId: string) => {
  return faker.string.uuid();
};

export const billing = mutableBilling;
