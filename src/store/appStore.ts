import { create } from 'zustand';
import { 
  User, Customer, Device, SubscriptionPlan, SupportTicket, 
  SLAConfig, RenewalHistory, AppNotification, ActivityLog,
  CustomerContact, CustomerAddress, TicketStatus, TicketPriority,
  PaymentStatus, UserRole, CustomerType, DeviceStatus, LicenseStatus, 
  LicenseType, SupportType, TicketCategory, RenewalStatus
} from '../types';

// Helper to make API calls directly to ERPNext to avoid circular dependencies
const erpnextRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
  const baseUrl = '';
  const apiKey = import.meta.env.VITE_ERPNEXT_API_KEY || '2be0a74aae72d50';
  const apiSecret = import.meta.env.VITE_ERPNEXT_API_SECRET || '46d66d41277e3dc';
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `token ${apiKey}:${apiSecret}`
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ERPNext API failed: ${response.status} - ${errorText}`);
  }
  
  const json = await response.json();
  return json.data;
};

// Helper function to calculate License Status based on current date (2026-06-19)
export const calculateLicenseStatus = (endDateStr: string, currentStatus: string): any => {
  if (currentStatus === 'Suspended') return 'Suspended';
  if (currentStatus === 'Trial') {
    const end = new Date(endDateStr);
    const today = new Date('2026-06-19');
    if (end < today) return 'Expired';
    return 'Trial';
  }
  
  const end = new Date(endDateStr);
  const today = new Date('2026-06-19');
  
  if (end < today) {
    return 'Expired';
  }
  
  const diffTime = Math.abs(end.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) {
    return 'Expiring Soon';
  }
  
  return 'Active';
};

interface AppState {
  currentUser: User;
  customers: Customer[];
  devices: Device[];
  plans: SubscriptionPlan[];
  renewalHistory: RenewalHistory[];
  tickets: SupportTicket[];
  slaConfigs: SLAConfig[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  isLoading: boolean;
  
  // Actions
  fetchLiveERPData: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  updateCustomerContacts: (customerId: string, contacts: CustomerContact[]) => void;
  updateCustomerAddress: (customerId: string, address: CustomerAddress) => void;
  updateCustomerNotes: (customerId: string, notes: string) => void;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (customer: Customer) => void;
  
  addDevice: (device: Device) => Promise<void>;
  updateDevice: (device: Device) => void;
  renewDeviceLicense: (deviceId: string, planId: string, amount: number, paymentStatus: PaymentStatus, remarks?: string) => Promise<void>;
  
  addSupportTicket: (ticket: SupportTicket) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, user: User) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority, user: User) => void;
  assignTicket: (ticketId: string, assignedTo: string, user: User) => void;
  addTicketComment: (ticketId: string, commentText: string, user: User, isInternal: boolean) => void;
  
  addSubscriptionPlan: (plan: SubscriptionPlan) => Promise<void>;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => void;
  
  addSLAConfig: (sla: SLAConfig) => Promise<void>;
  updateSLAConfig: (sla: SLAConfig) => void;
  
  markNotificationAsRead: (id: string) => void;
  addNotification: (type: string, message: string, targetId?: string) => void;
  addActivityLog: (type: string, message: string, userId: string, userName: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: {
    id: 'admin-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@apexglobal.com',
    role: 'admin',
    customerId: 'CUST-001'
  },
  customers: [],
  devices: [],
  plans: [],
  renewalHistory: [],
  tickets: [],
  slaConfigs: [],
  notifications: [],
  activityLogs: [],
  isLoading: false,
  
  fetchLiveERPData: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch Customers
      const erpCustomers = await erpnextRequest('/api/resource/Customer?fields=["name","customer_name","email_id","mobile_no","customer_type","creation"]');
      const customersMapped = erpCustomers.map((c: any): Customer => ({
        id: c.name,
        name: c.customer_name,
        contactPerson: c.customer_name,
        type: (c.customer_type === 'Company' ? 'Company' : c.customer_type === 'Individual' ? 'Individual' : 'Enterprise') as CustomerType,
        email: c.email_id || 'info@client.com',
        phone: c.mobile_no || 'N/A',
        status: 'Active',
        customerSince: c.creation ? c.creation.split(' ')[0] : '2026-06-19',
        address: { billingLine1: 'Main Road', city: 'HQ', state: 'State', country: 'Country', postalCode: '00000', shippingAddress: 'HQ Address', sameAsBilling: true },
        contacts: []
      }));

      // 2. Fetch Devices
      const erpDevices = await erpnextRequest('/api/resource/ADVGuard Device?fields=["*"]');
      const devicesMapped = erpDevices.map((d: any): Device => ({
        id: d.serial_number,
        customerId: d.customer,
        systemName: d.system_name,
        systemId: d.name,
        softwareVersion: d.software_version || 'v12.0',
        uptime: d.uptime || '99.9%',
        hostname: d.hostname || 'gateway.local',
        rebootCause: d.reboot_cause || 'None',
        systemTime: '2026-06-19 18:00:00',
        productModel: 'ADVGuard Firewall',
        serialNumber: d.serial_number,
        macAddress: d.mac_address || '00:00:00:00:00:00',
        ipAddress: d.ip_address || '192.168.1.1',
        location: d.location || 'Server Closet',
        installationDate: d.license_start_date || '2026-06-19',
        activationDate: d.license_start_date || '2026-06-19',
        status: (d.status || 'Active') as DeviceStatus,
        lastSyncDate: '2026-06-19 18:00:00',
        licenseStatus: calculateLicenseStatus(d.license_end_date, d.license_status || 'Active') as LicenseStatus,
        licenseType: (d.license_type || 'Yearly') as LicenseType,
        licenseStartDate: d.license_start_date || '2026-06-19',
        licenseEndDate: d.license_end_date || '2027-06-19',
        renewalDate: d.license_end_date || '2027-06-19',
        securitySuiteValidUntil: d.license_end_date || '2027-06-19',
        supportValidUntil: d.support_valid_until || '2027-06-19',
        supportType: (d.support_type || '8x5') as SupportType,
        autoRenewal: d.auto_renewal === 1,
        lastRenewalDate: d.license_start_date || '2026-06-19',
        nextRenewalDueDate: d.license_end_date || '2027-06-19'
      }));

      // 3. Fetch Plans
      const erpPlans = await erpnextRequest('/api/resource/ADVGuard Subscription Plan?fields=["*"]');
      const plansMapped = erpPlans.map((p: any): SubscriptionPlan => ({
        id: p.name,
        name: p.plan_name,
        duration: (p.duration || 'Yearly') as any,
        price: p.price || 0,
        currency: p.currency || 'USD',
        includedSupportType: (p.included_support_type || '8x5') as SupportType,
        description: p.description || '',
        active: p.active === 1
      }));

      // 4. Fetch Renewals
      const erpRenewals = await erpnextRequest('/api/resource/ADVGuard Renewal Record?fields=["*"]');
      const renewalsMapped = erpRenewals.map((r: any): RenewalHistory => ({
        id: r.name,
        customerId: r.customer,
        deviceId: r.device,
        previousEndDate: r.previous_license_end_date || '',
        newStartDate: r.new_license_start_date || '',
        newEndDate: r.new_license_end_date || '',
        planId: r.renewal_plan || '',
        amount: r.renewal_amount || 0,
        paymentStatus: (r.payment_status || 'Paid') as PaymentStatus,
        status: (r.status || 'Confirmed') as RenewalStatus,
        remarks: r.remarks || '',
        renewalDate: r.renewal_date || '2026-06-19'
      }));

      // 5. Fetch Tickets (Issues)
      const erpTickets = await erpnextRequest('/api/resource/Issue?fields=["name","subject","description","customer","status","priority","creation"]');
      const ticketsMapped = erpTickets.map((t: any): SupportTicket => ({
        id: t.name,
        customerId: t.customer || 'CUST-001',
        deviceId: 'DEV-GENERIC',
        subject: t.subject,
        description: t.description || '',
        category: 'Technical',
        priority: (t.priority || 'Medium') as TicketPriority,
        status: (t.status === 'Open' ? 'Open' : t.status === 'Replied' ? 'Waiting for Customer' : 'Resolved') as TicketStatus,
        createdBy: 'ERPNext System',
        createdDate: t.creation ? t.creation.split(' ')[0] : '2026-06-19',
        dueDate: '2026-06-21',
        slaPolicyId: 'sla-3',
        slaStatus: 'Within SLA',
        firstResponseDue: '2026-06-19',
        resolutionDue: '2026-06-21',
        comments: []
      }));

      // 6. Fetch SLA configs
      const erpSLAs = await erpnextRequest('/api/resource/ADVGuard SLA Config?fields=["*"]');
      const slasMapped = erpSLAs.map((s: any): SLAConfig => ({
        id: s.name,
        name: s.sla_name,
        customerType: (s.customer_type || 'All') as any,
        supportType: (s.support_type || 'All') as any,
        priority: (s.priority || 'Medium') as TicketPriority,
        firstResponseTime: s.first_response_time || 4,
        resolutionTime: s.resolution_time || 12,
        businessHours: s.business_hours || '8x5',
        escalation1: s.escalation1 || 'None',
        escalation2: s.escalation2 || 'None',
        escalation3: s.escalation3 || 'None',
        active: s.active === 1
      }));

      set({
        customers: customersMapped,
        devices: devicesMapped,
        plans: plansMapped,
        renewalHistory: renewalsMapped,
        tickets: ticketsMapped,
        slaConfigs: slasMapped,
        isLoading: false
      });
    } catch (err) {
      console.error("Failed to query live ERPNext tables:", err);
      set({ isLoading: false });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  
  updateCustomerContacts: (customerId, contacts) => {
    set(state => ({
      customers: state.customers.map(c => c.id === customerId ? { ...c, contacts } : c)
    }));
  },
  
  updateCustomerAddress: (customerId, address) => {
    set(state => ({
      customers: state.customers.map(c => c.id === customerId ? { ...c, address } : c)
    }));
  },
  
  updateCustomerNotes: (customerId, notes) => {
    set(state => ({
      customers: state.customers.map(c => c.id === customerId ? { ...c, notes } : c)
    }));
  },
  
  addCustomer: async (customer) => {
    try {
      await erpnextRequest('/api/resource/Customer', 'POST', {
        customer_name: customer.name,
        customer_type: 'Company',
        email_id: customer.email,
        mobile_no: customer.phone
      });
      await get().fetchLiveERPData();
    } catch (err) {
      console.error(err);
    }
  },
  
  updateCustomer: (customer) => {
    set(state => ({
      customers: state.customers.map(c => c.id === customer.id ? customer : c)
    }));
  },
  
  addDevice: async (device) => {
    try {
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
      await get().fetchLiveERPData();
    } catch (err) {
      console.error("Failed to register device in ERPNext:", err);
    }
  },
  
  updateDevice: (device) => {
    set(state => ({
      devices: state.devices.map(d => d.id === device.id ? device : d)
    }));
  },
  
  renewDeviceLicense: async (deviceId, planId, amount, paymentStatus, remarks) => {
    try {
      const plan = get().plans.find(p => p.id === planId);
      const device = get().devices.find(d => d.id === deviceId);
      if (!plan || !device) return;

      let durationMonths = 12;
      if (plan.duration === 'Monthly') durationMonths = 1;
      else if (plan.duration === 'Quarterly') durationMonths = 3;
      else if (plan.duration === 'Half-Yearly') durationMonths = 6;

      const finalStartDate = new Date(device.licenseEndDate);
      const finalEndDate = new Date(finalStartDate);
      finalEndDate.setMonth(finalEndDate.getMonth() + durationMonths);

      const startStr = finalStartDate.toISOString().split('T')[0];
      const endStr = finalEndDate.toISOString().split('T')[0];

      await erpnextRequest('/api/resource/ADVGuard Renewal Record', 'POST', {
        customer: device.customerId,
        device: device.id,
        previous_license_end_date: device.licenseEndDate,
        new_license_start_date: startStr,
        new_license_end_date: endStr,
        renewal_plan: planId,
        renewal_amount: amount,
        payment_status: paymentStatus,
        status: paymentStatus === 'Paid' ? 'Confirmed' : 'Draft',
        remarks: remarks || `Renewed via ${plan.name}`,
        renewal_date: '2026-06-19'
      });

      // Update Device Dates
      if (paymentStatus === 'Paid') {
        await erpnextRequest(`/api/resource/ADVGuard Device/${device.systemId}`, 'PUT', {
          license_start_date: startStr,
          license_end_date: endStr,
          license_status: "Active",
          support_valid_until: endStr
        });
      }

      await get().fetchLiveERPData();
    } catch (err) {
      console.error(err);
    }
  },
  
  addSupportTicket: async (ticket) => {
    try {
      await erpnextRequest('/api/resource/Issue', 'POST', {
        subject: ticket.subject,
        description: ticket.description,
        customer: ticket.customerId,
        priority: ticket.priority,
        status: 'Open'
      });
      await get().fetchLiveERPData();
    } catch (err) {
      console.error(err);
    }
  },
  
  updateTicketStatus: (ticketId, status, user) => {
    // Local fallback/sync
  },
  
  updateTicketPriority: (ticketId, priority, user) => {
    // Local fallback
  },
  
  assignTicket: (ticketId, assignedTo, user) => {
    // Local assignment
  },
  
  addTicketComment: (ticketId, commentText, user, isInternal) => {
    // Add comment local
  },
  
  addSubscriptionPlan: async (plan) => {
    try {
      await erpnextRequest('/api/resource/ADVGuard Subscription Plan', 'POST', {
        plan_name: plan.name,
        duration: plan.duration,
        price: plan.price,
        currency: plan.currency,
        included_support_type: plan.includedSupportType,
        description: plan.description,
        active: plan.active ? 1 : 0
      });
      await get().fetchLiveERPData();
    } catch (err) {
      console.error(err);
    }
  },
  
  updateSubscriptionPlan: (plan) => {},
  
  addSLAConfig: async (sla) => {
    try {
      await erpnextRequest('/api/resource/ADVGuard SLA Config', 'POST', {
        sla_name: sla.name,
        customer_type: sla.customerType,
        support_type: sla.supportType,
        priority: sla.priority,
        first_response_time: sla.firstResponseTime,
        resolution_time: sla.resolutionTime,
        business_hours: sla.businessHours,
        escalation1: sla.escalation1,
        escalation2: sla.escalation2,
        escalation3: sla.escalation3,
        active: sla.active ? 1 : 0
      });
      await get().fetchLiveERPData();
    } catch (err) {
      console.error(err);
    }
  },
  
  updateSLAConfig: (sla) => {},
  
  markNotificationAsRead: (id) => {},
  addNotification: (type, message, targetId) => {},
  addActivityLog: (type, message, userId, userName) => {}
}));
export default useAppStore;
