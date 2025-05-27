import { faker } from '@faker-js/faker';
import { DeviceType, TenantType, UserType, DeviceType2, Attribute, DeviceContractItem, UnregisteredDeviceType } from '../../commons/models.js';

export function generateDeviceTypes(): DeviceType[] {
  return [
    { name: "Server", option: "Standard", description: faker.lorem.sentence() },
    { name: "Workstation", option: "Standard", description: faker.lorem.sentence() },
    { name: "Mobile", option: "Standard", description: faker.lorem.sentence() },
    { name: "IoT", option: "Standard", description: faker.lorem.sentence() },
    { name: "Other", option: "Standard", description: faker.lorem.sentence() }
  ];
}

export const defaultDeviceTypes: DeviceType[] = generateDeviceTypes();

export const getDeviceTypeByName = (name: string): DeviceType => {
  return defaultDeviceTypes.find(type => type.name === name) || 
    { name, option: "", description: "" };
};
