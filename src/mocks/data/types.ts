import { Attribute } from '../types.js';

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
 * Tenant data structure with references instead of nesting
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
  subscriptionId: string; // Reference to parent subscription
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
 * Unregistered device data structure
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
