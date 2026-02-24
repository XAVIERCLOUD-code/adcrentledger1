export interface Tenant {
  id: string;
  name: string;
  unit: string;
  floor: 0 | 1 | 2 | 3;

  // Contact
  contactPerson?: string;
  contactNumber?: string;
  email?: string;

  // Lease Details
  leaseStart?: string;
  leaseEnd?: string;
  paymentTerms?: string;
  escalationDetails?: string;

  // Financials
  rentGross: number;
  rentNet?: number;
  vat?: number;
  ewt?: number;
  signageFee?: number;
  totalDue?: number; // The generic monthly due amount

  // Additional Lease Info
  escalationRate?: number; // percent
  vatPercent?: number; // percent
  ewtPercent?: number; // percent
}

export interface BillRecord {
  id: string;
  tenantId: string;
  month: string; // YYYY-MM
  totalBill: number;
  isPaid: boolean;
  paidDate?: string;
  createdAt: string;

  // Breakdown (Optional)
  rent?: number;
  electricBill?: number;
  waterBill?: number;
  electricUsage?: number; // kWh
  waterUsage?: number; // cu.m
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'meeting' | 'holiday' | 'event' | 'payroll';
  description?: string;
}

export interface BuildingRequirement {
  id: string;
  name: string;
  issuedDate: string; // YYYY-MM-DD
  validityYears: number;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Inactive";
  activationDate?: string;
  documentUrl?: string; // Supabase Storage public URL
}

export interface MonthlyCollection {
  month: string;
  total: number;
  paid: number;
  unpaid: number;
}

export type UserRole = 'admin' | 'viewer';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  info: string[]; // e.g. ["Night Shift Guard", "Pollution Control"]
  iconName: string; // To dynamically render "Shield", "User", "Briefcase" etc
  color: string;
  bg: string;
  imageUrl?: string; // Stored as Base64 string for avatars
  email?: string;
  phone?: string;
}
