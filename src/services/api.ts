import { useAppStore } from '../store/appStore';
import { ERPNEXT_CONFIG } from '../config/erpnext';
import { 
  Customer, Device, SubscriptionPlan, SupportTicket, 
  SLAConfig, RenewalHistory, AppNotification, ActivityLog,
  CustomerContact, CustomerAddress, TicketStatus, TicketPriority,
  PaymentStatus, User
} from '../types';

// Helper to make API calls to ERPNext
const erpnextRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
  const url = `${ERPNEXT_CONFIG.BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `token ${ERPNEXT_CONFIG.API_KEY}:${ERPNEXT_CONFIG.API_SECRET}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    throw new Error(`ERPNext API error: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

export const authService = {
  getCurrentUser: (): User => {
    return useAppStore.getState().currentUser;
  },
  setCurrentUser: (user: User) => {
    useAppStore.getState().setCurrentUser(user);
  }
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      try {
        const erpCustomers = await erpnextRequest('/api/resource/Customer?fields=["name","customer_name","email_id","mobile_no"]');
        return erpCustomers.map((c: any) => ({
          id: c.name,
          name: c.customer_name,
          contactPerson: c.customer_name || 'N/A',
          type: 'Company',
          email: c.email_id || 'no-email@company.com',
          phone: c.mobile_no || 'N/A',
          status: 'Active',
          customerSince: '2026-01-01',
          contacts: [],
          address: { billingLine1: '', city: '', state: '', country: '', postalCode: '', shippingAddress: '', sameAsBilling: true }
        }));
      } catch (err) {
        console.error("ERPNext load error, falling back to mock database.", err);
      }
    }
    return useAppStore.getState().customers;
  },
  getById: async (id: string): Promise<Customer | undefined> => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      try {
        const c = await erpnextRequest(`/api/resource/Customer/${id}`);
        return {
          id: c.name,
          name: c.customer_name,
          contactPerson: c.customer_name || 'N/A',
          type: 'Company',
          email: c.email_id || '',
          phone: c.mobile_no || '',
          status: 'Active',
          customerSince: '2026-01-01',
          contacts: [],
          address: { billingLine1: '', city: '', state: '', country: '', postalCode: '', shippingAddress: '', sameAsBilling: true }
        };
      } catch (err) {
        console.error(err);
      }
    }
    return useAppStore.getState().customers.find(c => c.id === id);
  },
  add: async (customer: Customer) => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      await erpnextRequest('/api/resource/Customer', 'POST', {
        customer_name: customer.name,
        customer_type: 'Company',
        email_id: customer.email,
        mobile_no: customer.phone
      });
    }
    useAppStore.getState().addCustomer(customer);
  },
  update: (customer: Customer) => {
    useAppStore.getState().updateCustomer(customer);
  },
  updateContacts: (customerId: string, contacts: CustomerContact[]) => {
    useAppStore.getState().updateCustomerContacts(customerId, contacts);
  },
  updateAddress: (customerId: string, address: CustomerAddress) => {
    useAppStore.getState().updateCustomerAddress(customerId, address);
  },
  updateNotes: (customerId: string, notes: string) => {
    useAppStore.getState().updateCustomerNotes(customerId, notes);
  }
};

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      try {
        const erpDevices = await erpnextRequest('/api/resource/ADVGuard Device?fields=["*"]');
        return erpDevices.map((d: any) => ({
          id: d.serial_number,
          customerId: d.customer,
          systemName: d.system_name,
          systemId: d.name,
          softwareVersion: d.software_version || 'v1.0',
          uptime: d.uptime || 'N/A',
          hostname: d.hostname || 'N/A',
          rebootCause: d.reboot_cause || 'N/A',
          systemTime: '2026-06-19',
          productModel: 'ADVGuard Firewall',
          serialNumber: d.serial_number,
          macAddress: d.mac_address || '',
          ipAddress: d.ip_address || '',
          location: d.location || 'HQ',
          installationDate: d.license_start_date || '2026-01-01',
          activationDate: d.license_start_date || '2026-01-01',
          status: d.status || 'Active',
          lastSyncDate: '2026-06-19',
          licenseStatus: d.license_status || 'Active',
          licenseType: d.license_type || 'Yearly',
          licenseStartDate: d.license_start_date || '2026-01-01',
          licenseEndDate: d.license_end_date || '2027-01-01',
          renewalDate: d.license_end_date || '2027-01-01',
          securitySuiteValidUntil: d.license_end_date || '2027-01-01',
          supportValidUntil: d.support_valid_until || '2027-01-01',
          supportType: d.support_type || '8x5',
          autoRenewal: d.auto_renewal === 1,
          lastRenewalDate: d.license_start_date || '2026-01-01',
          nextRenewalDueDate: d.license_end_date || '2027-01-01'
        }));
      } catch (err) {
        console.error(err);
      }
    }
    return useAppStore.getState().devices;
  },
  getById: async (id: string): Promise<Device | undefined> => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      try {
        const d = await erpnextRequest(`/api/resource/ADVGuard Device/${id}`);
        return {
          id: d.serial_number,
          customerId: d.customer,
          systemName: d.system_name,
          systemId: d.name,
          softwareVersion: d.software_version || 'v1.0',
          uptime: d.uptime || 'N/A',
          hostname: d.hostname || 'N/A',
          rebootCause: d.reboot_cause || 'N/A',
          systemTime: '2026-06-19',
          productModel: 'ADVGuard Firewall',
          serialNumber: d.serial_number,
          macAddress: d.mac_address || '',
          ipAddress: d.ip_address || '',
          location: d.location || 'HQ',
          installationDate: d.license_start_date || '2026-01-01',
          activationDate: d.license_start_date || '2026-01-01',
          status: d.status || 'Active',
          lastSyncDate: '2026-06-19',
          licenseStatus: d.license_status || 'Active',
          licenseType: d.license_type || 'Yearly',
          licenseStartDate: d.license_start_date || '2026-01-01',
          licenseEndDate: d.license_end_date || '2027-01-01',
          renewalDate: d.license_end_date || '2027-01-01',
          securitySuiteValidUntil: d.license_end_date || '2027-01-01',
          supportValidUntil: d.support_valid_until || '2027-01-01',
          supportType: d.support_type || '8x5',
          autoRenewal: d.auto_renewal === 1,
          lastRenewalDate: d.license_start_date || '2026-01-01',
          nextRenewalDueDate: d.license_end_date || '2027-01-01'
        };
      } catch (err) {
        console.error(err);
      }
    }
    return useAppStore.getState().devices.find(d => d.id === id);
  },
  getByCustomerId: async (customerId: string): Promise<Device[]> => {
    const list = await deviceService.getAll();
    return list.filter(d => d.customerId === customerId);
  },
  add: async (device: Device) => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      await erpnextRequest('/api/resource/ADVGuard Device', 'POST', {
        system_name: device.systemName,
        serial_number: device.serialNumber,
        customer: device.customerId,
        mac_address: device.macAddress,
        ip_address: device.ipAddress,
        software_version: device.softwareVersion,
        hostname: device.hostname,
        status: device.status,
        license_status: device.licenseStatus,
        license_type: device.licenseType,
        license_start_date: device.licenseStartDate,
        license_end_date: device.licenseEndDate,
        support_valid_until: device.supportValidUntil,
        support_type: device.supportType,
        auto_renewal: device.autoRenewal ? 1 : 0,
        location: device.location
      });
    }
    useAppStore.getState().addDevice(device);
  },
  update: (device: Device) => {
    useAppStore.getState().updateDevice(device);
  }
};

export const subscriptionService = {
  getPlans: (): SubscriptionPlan[] => {
    return useAppStore.getState().plans;
  },
  addPlan: (plan: SubscriptionPlan) => {
    useAppStore.getState().addSubscriptionPlan(plan);
  },
  updatePlan: (plan: SubscriptionPlan) => {
    useAppStore.getState().updateSubscriptionPlan(plan);
  }
};

export const renewalService = {
  getHistory: (): RenewalHistory[] => {
    return useAppStore.getState().renewalHistory;
  },
  getHistoryByDeviceId: (deviceId: string): RenewalHistory[] => {
    return useAppStore.getState().renewalHistory.filter(r => r.deviceId === deviceId);
  },
  getHistoryByCustomerId: (customerId: string): RenewalHistory[] => {
    return useAppStore.getState().renewalHistory.filter(r => r.customerId === customerId);
  },
  renew: async (deviceId: string, planId: string, amount: number, paymentStatus: PaymentStatus, remarks?: string) => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      await erpnextRequest('/api/resource/ADVGuard Renewal Record', 'POST', {
        device: deviceId,
        renewal_plan: planId,
        renewal_amount: amount,
        payment_status: paymentStatus,
        status: paymentStatus === 'Paid' ? 'Confirmed' : 'Draft',
        remarks,
        renewal_date: '2026-06-19'
      });
    }
    useAppStore.getState().renewDeviceLicense(deviceId, planId, amount, paymentStatus, remarks);
  }
};

export const ticketService = {
  getAll: async (): Promise<SupportTicket[]> => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      try {
        const erpIssues = await erpnextRequest('/api/resource/Issue?fields=["name","subject","description","customer","status","priority"]');
        return erpIssues.map((i: any) => ({
          id: i.name,
          customerId: i.customer,
          deviceId: 'DEV-GENERIC',
          subject: i.subject,
          description: i.description || '',
          category: 'Technical',
          priority: i.priority || 'Medium',
          status: i.status === 'Open' ? 'Open' : i.status === 'Replied' ? 'Waiting for Customer' : 'Resolved',
          createdBy: 'ERPNext Sync',
          createdDate: '2026-06-19',
          dueDate: '2026-06-21',
          slaPolicyId: 'sla-3',
          slaStatus: 'Within SLA',
          firstResponseDue: '2026-06-19',
          resolutionDue: '2026-06-21',
          comments: []
        }));
      } catch (err) {
        console.error(err);
      }
    }
    return useAppStore.getState().tickets;
  },
  getById: async (id: string): Promise<SupportTicket | undefined> => {
    const list = await ticketService.getAll();
    return list.find(t => t.id === id);
  },
  getByCustomerId: async (customerId: string): Promise<SupportTicket[]> => {
    const list = await ticketService.getAll();
    return list.filter(t => t.customerId === customerId);
  },
  getByDeviceId: async (deviceId: string): Promise<SupportTicket[]> => {
    const list = await ticketService.getAll();
    return list.filter(t => t.deviceId === deviceId);
  },
  create: async (ticket: SupportTicket) => {
    if (ERPNEXT_CONFIG.isConfigured()) {
      await erpnextRequest('/api/resource/Issue', 'POST', {
        subject: ticket.subject,
        description: ticket.description,
        customer: ticket.customerId,
        priority: ticket.priority,
        status: 'Open'
      });
    }
    useAppStore.getState().addSupportTicket(ticket);
  },
  updateStatus: (ticketId: string, status: TicketStatus, user: User) => {
    useAppStore.getState().updateTicketStatus(ticketId, status, user);
  },
  updatePriority: (ticketId: string, priority: TicketPriority, user: User) => {
    useAppStore.getState().updateTicketPriority(ticketId, priority, user);
  },
  assign: (ticketId: string, assignedTo: string, user: User) => {
    useAppStore.getState().assignTicket(ticketId, assignedTo, user);
  },
  addComment: (ticketId: string, commentText: string, user: User, isInternal: boolean) => {
    useAppStore.getState().addTicketComment(ticketId, commentText, user, isInternal);
  }
};

export const slaService = {
  getConfigs: (): SLAConfig[] => {
    return useAppStore.getState().slaConfigs;
  },
  addConfig: (sla: SLAConfig) => {
    useAppStore.getState().addSLAConfig(sla);
  },
  updateConfig: (sla: SLAConfig) => {
    useAppStore.getState().updateSLAConfig(sla);
  }
};

export const reportService = {
  getActivityLogs: (): ActivityLog[] => {
    return useAppStore.getState().activityLogs;
  }
};

export const notificationService = {
  getAll: (): AppNotification[] => {
    return useAppStore.getState().notifications;
  },
  markAsRead: (id: string) => {
    useAppStore.getState().markNotificationAsRead(id);
  }
};
export default {
  authService,
  customerService,
  deviceService,
  subscriptionService,
  renewalService,
  ticketService,
  slaService,
  reportService,
  notificationService
};
