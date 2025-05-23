export type User = {
  id: string;
  name: string;
  email: string;
  roles: ("Owner" | "Engineer" | "Member")[];
  ipWhitelist: string[];
  mfaEnabled: boolean;
};

export type Attribute = {
  key: string;
  value: string;
};

export type DeviceType = {
  name: string;
  option: string;
  description: string;
};

export type Device = {
  id: string;
  name: string;
  type: string; // References DeviceType.name
  deviceId: string;
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
};

export type DeviceContractItem = {
  type: string; // References DeviceType.name
  quantity: number;
};

export type Tenant = {
  id: string;
  name: string;
  description?: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    country?: string;
  };
  contract: string;
  billingDetails?: {
    billingId?: string;
    deviceContract?: DeviceContractItem[];
    startDate?: string;
    endDate?: string;
    paymentType?: "One-time" | "Monthly" | "Annually";
    billingDate?: string; // For One-time payment
    dueDay?: number | "End of Month"; // For Monthly/Annually payment
    dueMonth?: number; // For Annually payment
    billingStartDate?: string;
    description?: string; // Description of the billing
  }[];
  subscription?: {
    name?: string;
    id?: string;
    description?: string;
    services?: string[];
    status?: string;
    startDate?: string;
    endDate?: string;
    configs?: string;
  };
  users?: User[];
  devices?: Device[];
};

export type DeviceWithTenant = Device & {
  tenantId: string;
  tenantName: string;
};

export type UnregisteredDevice = Omit<DeviceWithTenant, "tenantId" | "tenantName"> & {
  isUnregistered: true;
};
