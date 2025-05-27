import { faker } from '@faker-js/faker';
import { DeviceType, TenantType, UserType, DeviceType2, Attribute, DeviceContractItem, UnregisteredDeviceType } from '../../commons/models.js';

export function generateDeviceTypes(): DeviceType[] {
  return [
    { name: "AG10", option: "Standard", description: faker.lorem.sentence() },
    { name: "AR10", option: "Standard", description: faker.lorem.sentence() },
    { name: "AX11", option: "Standard", description: faker.lorem.sentence() },
    { name: "AC15", option: "Standard", description: faker.lorem.sentence() },
    { name: "AB11", option: "Standard", description: faker.lorem.sentence() }
  ];
}

export const defaultDeviceTypes: DeviceType[] = generateDeviceTypes();

export const getDeviceTypeByName = (name: string): DeviceType => {
  return defaultDeviceTypes.find(type => type.name === name) || 
    { name, option: "", description: "" };
};
