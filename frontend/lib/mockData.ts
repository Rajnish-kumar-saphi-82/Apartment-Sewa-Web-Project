// Client-side mock database to sync state across Admin, Owner, and Tenant views

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
}

export interface Unit {
  id: string;
  flatNo: string;
  floor: string;
  rent: number;
  status: "Occupied" | "Vacant";
  tenantName?: string;
  tenantPhone?: string;
  image?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  flatNo: string;
  houseCode: string;
}

export interface Bill {
  id: string;
  flatNo: string;
  tenantName: string;
  month: string;
  rentCost: number;
  electricityCost: number;
  waterCost: number;
  serviceCost: number;
  totalCost: number;
  status: "Paid" | "Pending";
  paymentDate?: string;
  paymentMethod?: string;
}

export interface MaintenanceTicket {
  id: string;
  flatNo: string;
  description: string;
  urgency: "urgent" | "priority" | "new" | "resolved";
  status: "Pending" | "In Progress" | "Fixed";
  image: string;
  diagnostic?: string;
  cost?: string;
}

const defaultNotices: Notice[] = [];
const defaultUnits: Unit[] = [];
const defaultTenants: Tenant[] = [];
const defaultBills: Bill[] = [];
const defaultTickets: MaintenanceTicket[] = [];

export const STORAGE_KEYS = {
  notices: "sewa_notices",
  units: "sewa_units",
  tenants: "sewa_tenants",
  bills: "sewa_bills",
  tickets: "sewa_tickets",
  adminUsers: "sewa_admin_users",
} as const;

// LocalStorage helpers
const isClient = () => typeof window !== "undefined";

const getStored = <T>(key: string, defaultValue: T): T => {
  if (!isClient()) return defaultValue;
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val);
  } catch {
    return defaultValue;
  }
};

const setStored = <T>(key: string, value: T) => {
  if (isClient()) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// NOTICE BOARD
export const getNotices = (): Notice[] => getStored(STORAGE_KEYS.notices, defaultNotices);
export const addNotice = (title: string, message: string) => {
  const list = getNotices();
  const item: Notice = {
    id: `n-${Date.now()}`,
    title,
    message,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };
  list.unshift(item); // latest notice on top
  setStored(STORAGE_KEYS.notices, list);
  return item;
};

// UNITS
export const getUnits = (): Unit[] => getStored(STORAGE_KEYS.units, defaultUnits);
export const addUnit = (flatNo: string, floor: string, rent: number, image?: string) => {
  const list = getUnits();
  const item: Unit = {
    id: `u-${Date.now()}`,
    flatNo,
    floor,
    rent: Number(rent),
    status: "Vacant",
    image: image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60"
  };
  list.push(item);
  setStored(STORAGE_KEYS.units, list);
  return item;
};
export const updateUnitStatus = (id: string, status: "Occupied" | "Vacant", tenantName?: string, tenantPhone?: string) => {
  const list = getUnits();
  const updated = list.map(u => u.id === id ? { ...u, status, tenantName, tenantPhone } : u);
  setStored(STORAGE_KEYS.units, updated);
};

// TENANTS
export const getTenants = (): Tenant[] => getStored(STORAGE_KEYS.tenants, defaultTenants);
export const addTenant = (name: string, phone: string, flatNo: string) => {
  const list = getTenants();
  const code = `SEWA-${flatNo}-${Math.random().toString(36).substring(2, 4).toUpperCase()}${Math.floor(Math.random() * 10)}`;
  const item: Tenant = {
    id: `t-${Date.now()}`,
    name,
    phone,
    flatNo,
    houseCode: code
  };
  list.push(item);
  setStored(STORAGE_KEYS.tenants, list);
  
  // also link to the unit
  const units = getUnits();
  const matchingUnit = units.find(u => u.flatNo === flatNo);
  if (matchingUnit) {
    updateUnitStatus(matchingUnit.id, "Occupied", name, phone);
  }
  
  return item;
};

// BILLS
export const getBills = (): Bill[] => getStored(STORAGE_KEYS.bills, defaultBills);
export const addBill = (flatNo: string, month: string, rentCost: number, electricityCost: number, waterCost: number, serviceCost: number) => {
  const list = getBills();
  const tenants = getTenants();
  const tenant = tenants.find(t => t.flatNo === flatNo);
  const name = tenant ? tenant.name : "Unassigned Tenant";
  
  const total = Number(rentCost) + Number(electricityCost) + Number(waterCost) + Number(serviceCost);
  const item: Bill = {
    id: `b-${Date.now()}`,
    flatNo,
    tenantName: name,
    month,
    rentCost: Number(rentCost),
    electricityCost: Number(electricityCost),
    waterCost: Number(waterCost),
    serviceCost: Number(serviceCost),
    totalCost: total,
    status: "Pending"
  };
  list.unshift(item);
  setStored(STORAGE_KEYS.bills, list);
  return item;
};
export const payBill = (id: string, method: string = "Khalti Wallet") => {
  const list = getBills();
  const updated = list.map(b => b.id === id ? {
    ...b,
    status: "Paid" as const,
    paymentDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    paymentMethod: method
  } : b);
  setStored(STORAGE_KEYS.bills, updated);
};

// MAINTENANCE TICKETS
export const getTickets = (): MaintenanceTicket[] => getStored(STORAGE_KEYS.tickets, defaultTickets);
export const addTicket = (flatNo: string, description: string, image: string) => {
  const list = getTickets();
  const item: MaintenanceTicket = {
    id: `MT-${Math.floor(1000 + Math.random() * 9000)}`,
    flatNo,
    description,
    urgency: "new",
    status: "Pending",
    image: image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60",
    diagnostic: "AI scanning pending. Processing components...",
  };
  list.unshift(item);
  setStored(STORAGE_KEYS.tickets, list);
  return item;
};
export const updateTicketStatus = (id: string, status: "Pending" | "In Progress" | "Fixed") => {
  const list = getTickets();
  const updated = list.map(t => t.id === id ? {
    ...t,
    status,
    urgency: status === "Fixed" ? ("resolved" as const) : t.urgency
  } : t);
  setStored(STORAGE_KEYS.tickets, updated);
};
