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
  contact: {
    first_name: string;
    last_name: string;
    department: string;
    language: '日本語' | 'English';
    email: string;
    phone_office: string;
    phone_mobile: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state_prefecture: string;
    country: string;
    postal_code: string;
  };
  corresponding_subscription_id: string;
  subscription?: {
    id: string;
    name: string;
    description: string;
    type: 'Evergreen' | 'Termed';
    status: 'Active' | 'Cancelled';
    start_date: string;
    end_date: string;
    enabled_app_DMS: boolean;
    enabled_app_eVMS: boolean;
    enabled_app_CVR: boolean;
    enabled_app_AIAMS: boolean;
    config_SSH_terminal: boolean;
    config_AIAPP_installer: boolean;
  };
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
