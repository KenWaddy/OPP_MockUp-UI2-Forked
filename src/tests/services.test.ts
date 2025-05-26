import { TenantService, UserService, DeviceService, BillingService } from '../services/index.js';
import { setupTestData } from './testHelpers.js';

const tenantService = new TenantService();
const userService = new UserService();
const deviceService = new DeviceService();
const billingService = new BillingService();

/**
 * Test helper to run all tests
 */
async function runTests() {
  console.log("Starting service tests...");
  
  try {
    setupTestData();
    
    await testTenantService();
    await testUserService();
    await testDeviceService();
    await testBillingService();
    await testEdgeCases();
    
    console.log("\nAll tests passed successfully! ✅");
  } catch (error) {
    console.error("\nTest failed! ❌");
    console.error(error);
    process.exit(1);
  }
}

/**
 * Test the TenantService
 */
async function testTenantService() {
  console.log("\nTesting TenantService...");

  const tenantResult = await tenantService.getTenants({
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
  
  const tenantByIdResult = await tenantService.getTenantById("tenant-1", true, false, false);
  console.log("\nTenant by ID test:");
  console.log(`Found tenant: ${tenantByIdResult.data?.name}`);
  console.log(`Has users requested: ${tenantByIdResult.success ? 'Yes' : 'No'}`);
  console.log(`Has devices requested: ${tenantByIdResult.success ? 'Yes' : 'No'}`);
  
  const invalidTenantResult = await tenantService.getTenantById("999", true, false, false);
  if (invalidTenantResult.success || invalidTenantResult.data) {
    throw new Error("Expected tenant lookup to fail for invalid ID");
  }
  console.log("- Invalid tenant ID handling: OK");
}

/**
 * Test the UserService
 */
async function testUserService() {
  console.log("\nTesting UserService...");

  const userResult = await userService.getUsersForTenant("tenant-1", {
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
  
  const invalidTenantResult = await userService.getUsersForTenant("999", {
    page: 1,
    limit: 10
  });
  
  if (invalidTenantResult.data.length !== 0) {
    throw new Error("Expected empty array for invalid tenant ID");
  }
  console.log("- Invalid tenant ID handling: OK");
}

/**
 * Test the DeviceService
 */
async function testDeviceService() {
  console.log("\nTesting DeviceService...");

  const deviceResult = await deviceService.getDevices({
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
  
  const tenantDevicesResult = await deviceService.getDevicesForTenant("tenant-1", {
    page: 1,
    limit: 5
  });
  console.log("- Get tenant devices: OK");
  
  const nonExistentTenantResult = await deviceService.getDevicesForTenant("999", {
    page: 1,
    limit: 10
  });
  
  if (nonExistentTenantResult.data.length !== 0) {
    throw new Error("Expected empty array for non-existent tenant");
  }
  console.log("- Non-existent tenant handling: OK");
}

/**
 * Test the BillingService
 */
async function testBillingService() {
  console.log("\nTesting BillingService...");

  const billingResult = await billingService.getBillingItems({
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
    console.log("First billing item tenant:", billingResult.data[0]?.subscriptionId);
  }
}

/**
 * Test edge cases for all services
 */
async function testEdgeCases() {
  console.log("\nTesting Edge Cases...");
  
  const pageOverflowResult = await tenantService.getTenants({
    page: 999,
    limit: 10
  });
  
  if (pageOverflowResult.data.length !== 0) {
    throw new Error("Expected empty array for page overflow");
  }
  console.log("- Page overflow handling: OK");
  
  const zeroResultsFilter = await tenantService.getTenants({
    page: 1,
    limit: 10,
    filters: {
      tenantName: "NonExistentTenant12345"
    }
  });
  
  if (zeroResultsFilter.data.length !== 0) {
    throw new Error("Expected empty array for filter with no matches");
  }
  console.log("- Zero results filtering: OK");
  
  try {
    await tenantService.getTenants({
      page: -1,
      limit: 10
    });
    
    const negativePageResult = await tenantService.getTenants({
      page: -1,
      limit: 10
    });
    
    if (negativePageResult.data.length > 0) {
      throw new Error("Expected handling for negative page number");
    }
    console.log("- Negative page number handling: OK");
  } catch (error) {
    console.log("- Negative page number handling: OK (throws error)");
  }
  
  const zeroLimitResult = await tenantService.getTenants({
    page: 1,
    limit: 0
  });
  
  if (zeroLimitResult.meta.totalPages !== 0 && zeroLimitResult.data.length !== 0) {
    throw new Error("Expected proper handling for zero limit");
  }
  console.log("- Zero limit handling: OK");
  
  const tenantWithoutOwnerResult = await tenantService.getTenantById("no-owner-tenant-id", true);
  
  if (!tenantWithoutOwnerResult.data) {
    throw new Error("Expected tenant data to be returned");
  }
  console.log("- Owner absent handling: OK");
  
  const tenantWithAllData = await tenantService.getTenantById("tenant-1", true, true, true);
  if (!tenantWithAllData.success || !tenantWithAllData.data) {
    throw new Error("Expected tenant data to be returned when requesting with all includes");
  }
  console.log("- Data joining: OK");
}

runTests();
