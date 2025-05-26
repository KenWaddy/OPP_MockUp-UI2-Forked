export type UserType = {
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

export type DeviceType2 = {
  id: string;
  name: string;
  type: string; // References DeviceType.name
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
};

export type DeviceContractItem = {
  type: string; // References DeviceType.name
  quantity: number;
};

export type TenantType = {
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
  subscriptionId: string;
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
    id?: string;
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
  users?: UserType[];
  devices?: DeviceType2[];
};

export type DeviceWithTenant = DeviceType2 & {
  subscriptionId: string;
  tenantName: string;
};

export type UnregisteredDeviceType = Omit<DeviceWithTenant, "subscriptionId" | "tenantName"> & {
  isUnregistered: true;
};
