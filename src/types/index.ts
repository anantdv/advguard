export type UserRole = 'admin' | 'support' | 'sales' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customerId?: string; // Present only if role is 'customer'
}

export type CustomerType = 'Individual' | 'Company' | 'Government' | 'Enterprise' | 'Reseller';
export type CustomerStatus = 'Active' | 'Inactive' | 'Suspended';

export interface CustomerContact {
  name: string;
  designation: string;
  email: string;
  mobile: string;
  landline?: string;
  department: string;
  isPrimary: boolean;
  receivesRenewalAlerts: boolean;
  receivesSupportUpdates: boolean;
}

export interface CustomerAddress {
  billingLine1: string;
  billingLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  shippingAddress: string;
  sameAsBilling: boolean;
}

export interface Customer {
  id: string; // Customer ID
  name: string;
  type: CustomerType;
  companyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  taxId?: string; // GST/VAT/Tax ID
  status: CustomerStatus;
  customerSince: string;
  accountManager?: string;
  notes?: string;
  address: CustomerAddress;
  contacts: CustomerContact[];
}

export type DeviceStatus = 'Active' | 'Inactive' | 'Suspended' | 'Retired';
export type LicenseStatus = 'Active' | 'Expired' | 'Expiring Soon' | 'Suspended' | 'Trial';
export type LicenseType = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'Trial' | 'Lifetime';
export type SupportType = '8x5' | '24x7' | 'Premium' | 'Standard';

export interface Device {
  id: string; // Device ID
  customerId: string; // Linked Customer
  systemName: string;
  systemId: string;
  softwareVersion: string;
  uptime: string;
  hostname: string;
  rebootCause: string;
  systemTime: string;
  productModel: string;
  serialNumber: string;
  macAddress: string;
  ipAddress: string;
  location: string;
  installationDate: string;
  activationDate: string;
  status: DeviceStatus;
  lastSyncDate: string;
  notes?: string;
  
  // License fields
  licenseStatus: LicenseStatus;
  licenseType: LicenseType;
  licenseStartDate: string;
  licenseEndDate: string;
  renewalDate: string;
  securitySuiteValidUntil: string;
  supportValidUntil: string;
  supportType: SupportType;
  autoRenewal: boolean;
  lastRenewalDate: string;
  nextRenewalDueDate: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  price: number;
  currency: string;
  includedSupportType: SupportType;
  description: string;
  active: boolean;
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Partially Paid' | 'Failed';
export type RenewalStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface RenewalHistory {
  id: string;
  customerId: string;
  deviceId: string;
  previousEndDate: string;
  newStartDate: string;
  newEndDate: string;
  planId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  status: RenewalStatus;
  remarks?: string;
  renewalDate: string;
}

export type TicketCategory = 'Technical' | 'License' | 'Renewal' | 'Billing' | 'Hardware' | 'Network' | 'Other';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'Assigned' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed' | 'Cancelled';
export type SLAStatus = 'Within SLA' | 'Near Breach' | 'Breached';

export interface TicketComment {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  deviceId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string; // Support Agent Name
  createdBy: string; // User Name
  createdDate: string;
  dueDate: string;
  
  // SLA Fields
  slaPolicyId: string;
  slaStatus: SLAStatus;
  firstResponseDue: string;
  resolutionDue: string;
  firstResponseTime?: string;
  resolutionTime?: string;
  
  attachments?: string[];
  internalNotes?: string;
  comments: TicketComment[];
}

export interface SLAConfig {
  id: string;
  name: string;
  customerType: CustomerType | 'All';
  supportType: SupportType | 'All';
  priority: TicketPriority;
  firstResponseTime: number; // in hours
  resolutionTime: number; // in hours
  businessHours: string; // e.g. "8x5" or "24x7"
  escalation1: string; // designation or name
  escalation2: string;
  escalation3: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  timestamp: string;
  targetId?: string; // id of device, customer, or ticket
}

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  userId: string;
  userName: string;
}
