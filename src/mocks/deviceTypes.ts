import { DeviceType } from '../types/models.js';

export const defaultDeviceTypes: DeviceType[] = [
  { name: "Server", option: "Standard", description: "Server computing device" },
  { name: "Workstation", option: "Standard", description: "Desktop or laptop computing device" },
  { name: "Mobile", option: "Standard", description: "Smartphone or tablet device" },
  { name: "IoT", option: "Standard", description: "Internet of Things device" },
  { name: "Other", option: "Standard", description: "Other type of device" }
];

export const getDeviceTypeByName = (name: string): DeviceType => {
  return defaultDeviceTypes.find(type => type.name === name) || 
    { name, option: "", description: "" };
};
