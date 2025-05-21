// Import services
import { TenantService, UserService, DeviceService, BillingService } from '../services/index.js';

// Create service instances
const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();
const billingService = new BillingService();

/**
 * Test the TenantService
 */
console.log("Testing TenantService...");

// Test getTenants with pagination
const tenantResult = tenantService.getTenants({
  page: 1,
  limit: 3,
  filters: {
    contractType: "Evergreen"
  },
  sort: {
    field: 'tenant',
    order: 'asc'
  }
});
console.log("Tenant pagination test:");
console.log(`Total tenants: ${tenantResult.meta.total}`);
console.log(`Total pages: ${tenantResult.meta.totalPages}`);
console.log(`Returned tenants: ${tenantResult.data.length}`);
console.log("First tenant:", tenantResult.data[0]?.name);

// Test getTenantById
const tenantByIdResult = tenantService.getTenantById("1", true, false, false);
console.log("\nTenant by ID test:");
console.log(`Found tenant: ${tenantByIdResult.data?.name}`);
console.log(`Has users: ${tenantByIdResult.data?.users ? 'Yes' : 'No'}`);
console.log(`Has devices: ${tenantByIdResult.data?.devices ? 'Yes' : 'No'}`);

/**
 * Test the UserService
 */
console.log("\nTesting UserService...");

// Test getUsersForTenant with pagination
const userResult = userService.getUsersForTenant("1", {
  page: 1,
  limit: 2,
  filters: {
    role: "Owner"
  },
  sort: {
    field: 'name',
    order: 'asc'
  }
});
console.log("User pagination test:");
console.log(`Total users: ${userResult.meta.total}`);
console.log(`Total pages: ${userResult.meta.totalPages}`);
console.log(`Returned users: ${userResult.data.length}`);
if (userResult.data.length > 0) {
  console.log("First user:", userResult.data[0]?.name);
}

/**
 * Test the DeviceService
 */
console.log("\nTesting DeviceService...");

// Test getDevices with pagination
const deviceResult = deviceService.getDevices({
  page: 1,
  limit: 5,
  filters: {
    type: "Server"
  },
  sort: {
    field: 'name',
    order: 'asc'
  }
});
console.log("Device pagination test:");
console.log(`Total devices: ${deviceResult.meta.total}`);
console.log(`Total pages: ${deviceResult.meta.totalPages}`);
console.log(`Returned devices: ${deviceResult.data.length}`);
if (deviceResult.data.length > 0) {
  console.log("First device:", deviceResult.data[0]?.name);
}

/**
 * Test the BillingService
 */
console.log("\nTesting BillingService...");

// Test getBillingItems with pagination
const billingResult = billingService.getBillingItems({
  page: 1,
  limit: 4,
  sort: {
    field: 'tenantName',
    order: 'asc'
  }
});
console.log("Billing pagination test:");
console.log(`Total billing items: ${billingResult.meta.total}`);
console.log(`Total pages: ${billingResult.meta.totalPages}`);
console.log(`Returned billing items: ${billingResult.data.length}`);
if (billingResult.data.length > 0) {
  console.log("First billing item tenant:", billingResult.data[0]?.tenantName);
}

console.log("\nAll tests completed!");
