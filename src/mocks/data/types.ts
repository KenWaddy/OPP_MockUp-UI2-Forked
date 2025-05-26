import { Attribute } from '../types.js';

/**
 * Flat subscription data structure
 */
export interface FlatSubscription {
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
 * Flat tenant data structure with references instead of nesting
 */
export interface FlatTenant {
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
  corresponding_subscription_id: string;
}

/**
 * Flat user data structure with tenant reference
 */
export interface FlatUser {
  id: string;
  tenantId: string; // Reference to parent tenant
  name: string;
  email: string;
  roles: ("Owner" | "Engineer" | "Member")[];
  ipWhitelist: string[];
  mfaEnabled: boolean;
}

/**
 * Flat device data structure with tenant reference
 */
export interface FlatDevice {
  id: string;
  tenantId: string; // Reference to parent tenant
  name: string;
  type: string; // References DeviceType.name
  deviceId: string;
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
}

/**
 * Flat billing data structure with tenant reference
 */
export interface FlatBilling {
  id: string;
  tenantId: string; // Reference to parent tenant
  billingId: string;
  deviceContract: {
    type: string; // References DeviceType.name
    quantity: number;
  }[];
  startDate?: string;
  endDate?: string;
  paymentType: "One-time" | "Monthly" | "Annually";
  billingDate?: string; // For One-time payment
  dueMonth?: number; // For Annually payment
  description?: string; // Description of the billing
}

/**
 * Flat unregistered device data structure
 */
export interface FlatUnregisteredDevice {
  id: string;
  name: string;
  type: string; // References DeviceType.name
  deviceId: string;
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
  isUnregistered: true;
}
