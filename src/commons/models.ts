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

export type DeviceContractItem = {
  type: string; // References DeviceType.name
  quantity: number;
};

/**
 * Subscription data structure
 */
export interface Subscription {
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
}

/**
 * Tenant data structure with flattened contact fields
 * @note Consolidated from TenantType (nested) and Tenant (flat) - using flat structure to match mock data
 */
export interface Tenant {
  id: string;
  name: string;
  description: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  contact_department: string;
  language: '日本語' | 'English';
  contact_person_email: string;
  contact_phone_office: string;
  contact_phone_mobile: string;
  contact_company: string;
  contact_address1: string;
  contact_address2: string;
  contact_city: string;
  contact_state_prefecture: string;
  contact_country: string;
  contact_postal_code: string;
  subscriptionId: string;
}

/**
 * User data structure with subscription reference
 * @note Merged from UserType - added subscriptionId to match data usage
 */
export interface User {
  id: string;
  subscriptionId: string; // Reference to parent subscription
  name: string;
  email: string;
  roles: ("Owner" | "Engineer" | "Member")[];
  ipWhitelist: string[];
  mfaEnabled: boolean;
}

/**
 * Device data structure with subscription reference
 * @note Consolidated from DeviceType2 - using flat structure with subscriptionId
 */
export interface Device {
  id: string;
  subscriptionId: string; // Reference to parent subscription
  name: string;
  type: string; // References DeviceType.name
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
}

/**
 * Billing data structure with subscription reference
 */
export interface Billing {
  id: string;
  billingManageNo: string;
  subscriptionId: string; // Reference to parent subscription
  deviceContract: {
    type: string; // References DeviceType.name
    quantity: number;
  }[];
  deviceIds: {
    [deviceType: string]: string[]; // Array of device IDs grouped by device type
  };
  startDate?: string;
  endDate?: string;
  paymentType: "One-time" | "Monthly" | "Annually";
  description?: string; // Description of the billing
  isOld?: boolean; // Indicates if this is an old/expired contract
}

/**
 * Device with tenant information for display purposes
 */
export type DeviceWithTenant = Device & {
  tenantId: string;
  tenantName: string;
};

/**
 * Billing with tenant information for display purposes
 */
export type BillingWithTenant = Billing & {
  tenantId?: string; // Optional as subscriptionId is used in most places
  tenantName: string;
  nextBillingDate: string;
  totalDevices: number;
};

/**
 * Unregistered device data structure
 * @note Consolidated from UnregisteredDeviceType - using interface matching data usage
 */
export interface UnregisteredDevice {
  id: string;
  name: string;
  type: string; // References DeviceType.name
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
  isUnregistered: true;
}

/**
 * TenantType with nested contact information for UI display
 */
export interface TenantType {
  id: string;
  name: string;
  description: string;
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
}
/** @deprecated Use Device instead */
export type DeviceType2 = Device;
/** @deprecated Use UnregisteredDevice instead */
export type UnregisteredDeviceType = UnregisteredDevice;
