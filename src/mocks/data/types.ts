import { Attribute } from '../types.js';

/**
 * Flat tenant data structure with references instead of nesting
 */
export interface FlatTenant {
  id: string;
  name: string;
  description?: string;
  contract: string;
  status: string;
  billing: string;
  subscription?: {
    name?: string;
    id?: string;
    description?: string;
    services?: string[];
    termType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    configs?: string;
  };
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
  type: "Server" | "Workstation" | "Mobile" | "IoT" | "Other";
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
    type: FlatDevice["type"];
    quantity: number;
  }[];
  startDate?: string;
  endDate?: string;
  paymentType: "One-time" | "Monthly" | "Annually";
  billingDate?: string; // For One-time payment
  dueMonth?: number; // For Annually payment
}

/**
 * Flat unregistered device data structure
 */
export interface FlatUnregisteredDevice {
  id: string;
  name: string;
  type: "Server" | "Workstation" | "Mobile" | "IoT" | "Other";
  deviceId: string;
  serialNo: string;
  description: string;
  status: "Registered" | "Assigned" | "Activated";
  attributes: Attribute[];
  isUnregistered: true;
}
