import { UnregisteredDevice } from './types';

export const mockUnregisteredDevices: UnregisteredDevice[] = [
  {
    id: "unreg-1",
    name: "New Server",
    type: "Server",
    deviceId: "SRV-NEW-001",
    serialNo: "NEW123456",
    description: "New server awaiting registration",
    status: "Registered",
    attributes: [
      { key: "CPU", value: "24 cores" },
      { key: "RAM", value: "128GB" }
    ],
    isUnregistered: true
  },
  {
    id: "unreg-2",
    name: "New Workstation",
    type: "Workstation",
    deviceId: "WS-NEW-001",
    serialNo: "NEW654321",
    description: "New workstation awaiting registration",
    status: "Registered",
    attributes: [
      { key: "CPU", value: "8 cores" },
      { key: "RAM", value: "32GB" }
    ],
    isUnregistered: true
  }
];
