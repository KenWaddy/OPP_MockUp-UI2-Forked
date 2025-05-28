import { getNextSubscriptionId } from '../mockAPI/FakerData/subscriptions.js';
import { TenantType, Subscription, UnregisteredDevice, UserType } from './models';

/**
 * Factory functions for creating template objects with default values
 * This centralizes all template initialization patterns for better maintainability
 */
export const templates = {
  /**
   * Creates a new tenant template with empty/default values
   */
  createNewTenant: (): TenantType => ({
    id: `t-new-${Math.floor(Math.random() * 1000)}`,
    name: '',
    description: '',
    contact: {
      first_name: '',
      last_name: '',
      department: '',
      language: 'English',
      email: '',
      phone_office: '',
      phone_mobile: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state_prefecture: '',
      country: '',
      postal_code: ''
    },
    subscriptionId: ''
  }),
  
  /**
   * Creates a new subscription template with empty/default values
   */
  createNewSubscription: (): Subscription => ({
    id: `sub-new-${Math.floor(Math.random() * 1000)}`,
    name: '',
    description: '',
    type: 'Evergreen',
    status: 'Active',
    start_date: '',
    end_date: '',
    enabled_app_DMS: false,
    enabled_app_eVMS: false,
    enabled_app_CVR: false,
    enabled_app_AIAMS: false,
    config_SSH_terminal: false,
    config_AIAPP_installer: false
  }),
  
  /**
   * Creates a standard subscription template with predefined values
   */
  createStandardSubscription: (): Subscription => ({
    id: getNextSubscriptionId(),
    name: 'Standard Plan',
    description: 'Standard subscription plan',
    type: 'Evergreen',
    status: 'Active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    enabled_app_DMS: true,
    enabled_app_eVMS: true,
    enabled_app_CVR: false,
    enabled_app_AIAMS: false,
    config_SSH_terminal: true,
    config_AIAPP_installer: false
  }),
  
  /**
   * Creates a new device template with default values
   * Note: Using type assertion to match existing implementation in DevicePage.tsx
   */
  createNewDevice: () => ({
    id: `d-new-${Math.floor(Math.random() * 1000)}`,
    name: '',
    type: "Server",
    deviceId: `DEV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    serialNo: '',
    description: '',
    status: "Registered",
    attributes: [],
    isUnregistered: true
  } as unknown as UnregisteredDevice),
  
  /**
   * Creates a new user template with default values
   * @param isFirstUser If true, sets the role to 'Owner', otherwise 'Member'
   */
  createNewUser: (isFirstUser = false): UserType => ({
    id: `u-new-${Math.floor(Math.random() * 1000)}`,
    name: '',
    email: '',
    roles: isFirstUser ? ['Owner'] : ['Member'],
    ipWhitelist: [],
    mfaEnabled: false
  })
};
