import { faker } from '@faker-js/faker';
import { Device, UnregisteredDevice } from '../../types/models.js';
import { tenants } from './tenants.js';
import { Attribute, defaultDeviceTypes } from '../index.js';

/**
 * Generate attributes for a specific device type
 * @param type Device type
 * @returns Array of attributes
 */
function generateAttributesForDeviceType(type: string): Attribute[] {
  const attributes: Attribute[] = [];
  
  if (type === "Server") {
    attributes.push(
      { key: "CPU", value: `${faker.number.int({ min: 4, max: 64 })} cores` },
      { key: "RAM", value: `${faker.number.int({ min: 16, max: 512 })}GB` },
      { key: "Storage", value: `${faker.number.int({ min: 1, max: 20 })}TB` }
    );
    
    if (faker.datatype.boolean(0.7)) {
      attributes.push({ key: "OS", value: faker.helpers.arrayElement(["Linux", "Windows Server", "VMware ESXi"]) });
    }
  } else if (type === "Workstation") {
    attributes.push(
      { key: "CPU", value: `${faker.number.int({ min: 2, max: 16 })} cores` },
      { key: "RAM", value: `${faker.number.int({ min: 8, max: 64 })}GB` }
    );
    
    if (faker.datatype.boolean(0.8)) {
      attributes.push({ key: "OS", value: faker.helpers.arrayElement(["Windows 10", "Windows 11", "macOS", "Linux"]) });
    }
  } else if (type === "Mobile") {
    attributes.push(
      { key: "OS", value: faker.helpers.arrayElement(["iOS", "Android"]) },
      { key: "Model", value: faker.helpers.arrayElement(["iPhone", "Samsung Galaxy", "Google Pixel", "Huawei"]) }
    );
  } else if (type === "IoT") {
    attributes.push(
      { key: "Connectivity", value: faker.helpers.arrayElement(["WiFi", "Ethernet", "Bluetooth", "Zigbee", "LoRaWAN"]) },
      { key: "Power", value: faker.helpers.arrayElement(["Battery", "AC", "Solar", "PoE"]) }
    );
    
    if (faker.datatype.boolean(0.6)) {
      attributes.push({ key: "Protocol", value: faker.helpers.arrayElement(["MQTT", "HTTP", "CoAP", "OPC UA"]) });
    }
  } else {
    attributes.push(
      { key: "Type", value: faker.helpers.arrayElement(["Network", "Storage", "Security", "Peripheral"]) }
    );
  }
  
  if (faker.datatype.boolean(0.3)) {
    attributes.push({ key: "Location", value: faker.location.city() });
  }
  
  if (faker.datatype.boolean(0.4)) {
    attributes.push({ key: "Department", value: faker.helpers.arrayElement(["IT", "Engineering", "Operations", "Sales", "Marketing", "Finance"]) });
  }
  
  return attributes;
}

/**
 * Generate a list of devices for a specific subscription
 * @param subscriptionId ID of the subscription to generate devices for
 * @param count Number of devices to generate
 * @returns Array of device objects
 */
export function generateDevicesForTenant(subscriptionId: string, count: number): Device[] {
  const devices: Device[] = [];
  
  const deviceTypes: string[] = defaultDeviceTypes.map(type => type.name);
  
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(deviceTypes);
    const id = `device-${subscriptionId}-${i}`;
    
    const attributes: Attribute[] = generateAttributesForDeviceType(type);
    
    devices.push({
      id,
      subscriptionId,
      name: `${type} ${faker.string.alphanumeric(4).toUpperCase()}`,
      type,
      serialNo: faker.string.alphanumeric(12).toUpperCase(),
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(["Assigned", "Activated"]), // Remove "Registered" from possible statuses
      attributes
    });
  }
  
  return devices;
}

/**
 * Generate all devices for all tenants
 * @returns Array of all device objects
 */
export function generateAllDevices(): Device[] {
  const allDevices: Device[] = [];
  
  tenants.forEach(tenant => {
    const deviceCount = faker.number.int({ min: 10, max: 100 });
    const tenantDevices = generateDevicesForTenant(tenant.id, deviceCount);
    allDevices.push(...tenantDevices);
  });
  
  return allDevices;
}

/**
 * Generate devices with "Registered" status (not belonging to any tenant)
 * @param count Number of devices to generate
 * @returns Array of unregistered device objects
 */
export function generateRegisteredDevices(count: number = 30): UnregisteredDevice[] {
  const devices: UnregisteredDevice[] = [];
  
  const deviceTypes: string[] = defaultDeviceTypes.map(type => type.name);
  
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(deviceTypes);
    const id = `reg-${i}`;
    
    const attributes: Attribute[] = generateAttributesForDeviceType(type);
    
    devices.push({
      id,
      name: `${type} ${faker.string.alphanumeric(4).toUpperCase()}`,
      type,
      serialNo: faker.string.alphanumeric(12).toUpperCase(),
      description: faker.lorem.sentence(),
      status: "Registered",
      attributes,
      isUnregistered: true
    });
  }
  
  return devices;
}

/**
 * Generate unregistered devices
 * @param count Number of unregistered devices to generate
 * @returns Array of unregistered device objects
 */
export function generateUnregisteredDevices(count: number = 20): UnregisteredDevice[] {
  const devices: UnregisteredDevice[] = [];
  
  const deviceTypes: string[] = defaultDeviceTypes.map(type => type.name);
  
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(deviceTypes);
    const id = `unreg-${i}`;
    
    const attributes: Attribute[] = generateAttributesForDeviceType(type);
    
    devices.push({
      id,
      name: `New ${type} ${faker.string.alphanumeric(4).toUpperCase()}`,
      type,
      serialNo: `NEW${faker.string.alphanumeric(10).toUpperCase()}`,
      description: `New ${type.toLowerCase()} awaiting registration`,
      status: "Registered",
      attributes,
      isUnregistered: true
    });
  }
  
  return devices;
}

export const devices = generateAllDevices();

export const registeredDevices = generateRegisteredDevices(30);

export const unregisteredDevices = [...generateUnregisteredDevices(20), ...registeredDevices];
