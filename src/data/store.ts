import { Tenant, BillRecord, BuildingRequirement, CalendarEvent, User, UserRole, Staff } from "./types";

const TENANTS_KEY = "adc_tenants_v5";
const BILLS_KEY = "adc_bills_v5";
const EVENTS_KEY = "adc_events";
// const REMINDERS_KEY = "adc_reminders"; // Already defined below
const USER_KEY = "adc_user";
const STAFF_KEY = "adc_staff_v1";

// --- Staff Directory ---
const defaultStaff: Staff[] = [
  { id: "1", name: "Avelinda Monson", role: "CEO", info: ["Executive Management"], iconName: "Briefcase", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "2", name: "Adrianne Isobel Ramirez", role: "Admin Accounting Officer", info: ["Records & Billing"], iconName: "User", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "3", name: "Francis Delos Reyes", role: "Security", info: ["Pollution Control Officer", "Safety Inspector"], iconName: "Shield", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "4", name: "Errol Rosero", role: "Security", info: ["Night Shift Guard"], iconName: "Shield", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "5", name: "Danilo Donalino", role: "Security", info: ["Day Shift Guard"], iconName: "Shield", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "6", name: "Sonny Bisco", role: "Security", info: ["Roving Guard"], iconName: "Shield", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export function getStaff(): Staff[] {
  const stored = localStorage.getItem(STAFF_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STAFF_KEY, JSON.stringify(defaultStaff));
  return defaultStaff;
}

export function saveStaff(staffList: Staff[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staffList));
}

export function updateStaff(updatedStaff: Staff) {
  const staffList = getStaff();
  const index = staffList.findIndex((s) => s.id === updatedStaff.id);
  if (index !== -1) {
    staffList[index] = updatedStaff;
    saveStaff(staffList);
  }
}

// Auth
export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function login(username: string, password: string): boolean {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
  const viewerPassword = import.meta.env.VITE_VIEWER_PASSWORD || "viewer123";

  if (username === "admin" && password === adminPassword) {
    const user: User = { username: "admin", role: "admin", name: "Administrator" };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  }
  if (username === "viewer" && password === viewerPassword) {
    const user: User = { username: "viewer", role: "viewer", name: "Viewer" };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login";
}

// Seed data
const defaultTenants: Tenant[] = [
  {
    id: "t1", name: "The Coffee Table", unit: "G/F", floor: 1,
    contactPerson: "Miss Lei", leaseStart: "2022-02-01", leaseEnd: "2027-02-01",
    paymentTerms: "Every 28th via PDCs", escalationDetails: "5% starting March 2025",
    escalationRate: 5, vatPercent: 12, ewtPercent: 5,
    rentGross: 72245.19, rentNet: 64504.65, vat: 7740.56, ewt: 3225.23, totalDue: 69019.96
  },
  {
    id: "t2", name: "BPI/MS Insurance", unit: "2/F", floor: 2,
    contactPerson: "Sir Zaldy / Miss Jenny", leaseStart: "2023-04-01", leaseEnd: "2028-03-31",
    paymentTerms: "SOA 1st Mon / Follow up 25th", escalationDetails: "10% on 3rd year (April 2026)",
    escalationRate: 10, vatPercent: 12, ewtPercent: 5,
    rentGross: 131635.45, rentNet: 117531.65, vat: 14103.80, ewt: 5876.58, signageFee: 1800, totalDue: 125758.87
  },
  {
    id: "t3", name: "Graceland", unit: "Unknown", floor: 0,
    contactPerson: "Manager", leaseStart: "2022-10-15", leaseEnd: "2032-10-14",
    paymentTerms: "15th of month (Start Sep 15 2023)", escalationDetails: "1.5% yearly starting Oct 2025",
    escalationRate: 1.5, vatPercent: 12, ewtPercent: 5,
    rentGross: 147073.50, rentNet: 131315.62, vat: 15757.88, ewt: 6565.78, totalDue: 140507.72
  },
  {
    id: "t4", name: "Innovphil", unit: "Unknown", floor: 0,
    contactPerson: "Christine Joy San Juan", leaseStart: "2024-09-03", leaseEnd: "2029-09-03",
    paymentTerms: "Every 28th", escalationDetails: "10% on Sep 2026, then every year",
    escalationRate: 10, vatPercent: 12, ewtPercent: 5,
    rentGross: 124135.00, rentNet: 110834.82, vat: 13300.18, ewt: 5541.74, signageFee: 1000, totalDue: 118593.26
  },
  {
    id: "t5", name: "Dona Bellisima", unit: "201 & 203", floor: 2,
    contactPerson: "Ms. Dons", leaseStart: "2025-10-31", leaseEnd: "2027-10-31",
    paymentTerms: "Every 30th", escalationDetails: "10% on Sep 2026",
    escalationRate: 10, vatPercent: 12, ewtPercent: 5,
    rentGross: 33000.00, rentNet: 29464.29, vat: 5355.71, ewt: 1473.21, signageFee: 1000, totalDue: 31526.79
  },
  {
    id: "t6", name: "Whitesands Room 307", unit: "307", floor: 3,
    contactPerson: "Maricor Peranca", leaseStart: "2025-03-03", leaseEnd: "2026-03-03",
    paymentTerms: "Every 3rd via PDCs", escalationDetails: "None",
    rentGross: 10000.00, totalDue: 10000.00
  },
  {
    id: "t7", name: "AsiaLink Finance 301", unit: "301", floor: 3,
    contactPerson: "Sir Emman", leaseStart: "2025-10-10", leaseEnd: "2027-10-10",
    paymentTerms: "10th of month (Start Dec 10 2025)", escalationDetails: "10% starting Oct 2026",
    escalationRate: 10,
    rentGross: 17000.00, signageFee: 1000, totalDue: 17000.00
  },
  {
    id: "t8", name: "Vape Shop G/F", unit: "G/F", floor: 1,
    contactPerson: "Ericson Dy", leaseStart: "2026-03-01", leaseEnd: "2028-03-01",
    paymentTerms: "15th of month (Start May 2024)", escalationDetails: "5% on Mar 2027",
    escalationRate: 5,
    rentGross: 28777.77, totalDue: 28777.77
  },
  {
    id: "t9", name: "Basmayor Garchitorena", unit: "Unknown", floor: 0,
    contactPerson: "Atty Mich / Atty Lia", leaseStart: "2025-08-01", leaseEnd: "2026-08-01",
    paymentTerms: "1st of month (Cash)", escalationDetails: "Propose on renewal Aug 2026",
    escalationRate: 0, vatPercent: 12, ewtPercent: 5,
    rentGross: 28000.00, rentNet: 25000.00, vat: 3000.00, ewt: 1250.00, signageFee: 1000, totalDue: 26750.00
  },
  {
    id: "t10", name: "iSource Asia Business", unit: "Unknown", floor: 0,
    contactPerson: "Sir Romnick", leaseStart: "2024-04-01", leaseEnd: "2029-04-01",
    paymentTerms: "15th of month (Start June 2024)", escalationDetails: "5% on 3rd year (Apr 2026)",
    escalationRate: 5, vatPercent: 12, ewtPercent: 5,
    rentGross: 26000.00, rentNet: 23214.29, vat: 2785.71, ewt: 1160.71, totalDue: 24839.29
  },
  {
    id: "t11", name: "LUXE SKIN", unit: "Unknown", floor: 0,
    contactPerson: "Marigold Santos", leaseStart: "2024-03-28", leaseEnd: "2026-03-28",
    paymentTerms: "28th of month (Cash)", escalationDetails: "None",
    rentGross: 17200.00, totalDue: 17200.00
  },
  {
    id: "t12", name: "Z-Air Travel Agency", unit: "Unknown", floor: 0,
    contactPerson: "Joan Albis", leaseStart: "2025-07-15", leaseEnd: "2026-07-15",
    paymentTerms: "15th of month", escalationDetails: "None",
    rentGross: 10000.00, signageFee: 1000, totalDue: 10000.00
  },
  {
    id: "t14", name: "KEYSTONE 204 & 205", unit: "204 & 205", floor: 2,
    contactPerson: "Casey Abalayan", leaseStart: "2025-08-01", leaseEnd: "2026-08-01",
    paymentTerms: "1st of month / Renew Feb 14", escalationDetails: "None",
    rentGross: 25000.00, totalDue: 25000.00
  },
  {
    id: "t15", name: "E&C Solutions", unit: "Unknown", floor: 0,
    contactPerson: "Jasper Viloria", leaseStart: "2025-04-10", leaseEnd: "2028-04-10",
    paymentTerms: "10th of month (Start May 2025)", escalationDetails: "5% on 3rd year (Apr 2027)",
    escalationRate: 5,
    rentGross: 25000.00, totalDue: 25000.00
  },
  {
    id: "t16", name: "ATTY KAENA", unit: "Unknown", floor: 0,
    contactPerson: "", leaseStart: "", leaseEnd: "",
    paymentTerms: "", escalationDetails: "",
    rentGross: 5600.00, totalDue: 5600.00
  }
];

const REMINDERS_KEY = "adc_reminders";

const defaultRequirements: BuildingRequirement[] = [
  {
    id: "r1",
    name: "Pollution Control Officer License",
    issuedDate: "2024-03-15",
    validityYears: 2,
    expiryDate: "2026-03-15",
    status: "Active",
  },
  {
    id: "r2",
    name: "Fire Safety Inspection Certificate",
    issuedDate: "2025-01-10",
    validityYears: 1,
    expiryDate: "2026-01-10",
    status: "Active",
  },
];

export function getRequirements(): BuildingRequirement[] {
  const stored = localStorage.getItem(REMINDERS_KEY);
  let reqs: BuildingRequirement[] = defaultRequirements;

  if (stored) {
    try {
      reqs = JSON.parse(stored);
      if (!Array.isArray(reqs)) {
        console.error("Stored requirements is not an array:", reqs);
        reqs = defaultRequirements;
      }
    } catch (e) {
      console.error("Failed to parse requirements:", e);
      reqs = defaultRequirements;
    }
  }

  // Recalculate status on load
  const today = new Date();
  const warningThreshold = 30; // days

  const updatedReqs = reqs.map(r => {
    const expiry = new Date(r.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: BuildingRequirement["status"] = "Active";

    // If manually set to Inactive, keep it
    if (r.status === "Inactive") {
      return r;
    }

    if (diffDays < 0) status = "Expired";
    else if (diffDays <= warningThreshold) status = "Expiring Soon";

    return { ...r, status };
  });

  // Only save if status changed to avoid unnecessary writes, but for simplicity we save freshly calculated statuses
  return updatedReqs;
}

export function saveRequirements(reqs: BuildingRequirement[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reqs));
}

export function updateRequirement(updatedReq: BuildingRequirement) {
  const reqs = getRequirements();
  const index = reqs.findIndex((r) => r.id === updatedReq.id);
  if (index !== -1) {
    reqs[index] = updatedReq;
    saveRequirements(reqs);
  }
}

export function toggleRequirementStatus(id: string) {
  const reqs = getRequirements();
  const index = reqs.findIndex((r) => r.id === id);
  if (index !== -1) {
    const req = reqs[index];
    if (req.status === "Inactive") {
      req.status = "Active"; // Will be recalculated on next load or we can force calc here
      req.activationDate = new Date().toISOString().split("T")[0];
    } else {
      req.status = "Inactive";
      req.activationDate = undefined;
    }
    reqs[index] = req;
    saveRequirements(reqs);
  }
}

const defaultBills: BillRecord[] = [
  { id: "b1", tenantId: "t1", month: "2026-02", totalBill: 69019.96, isPaid: false, createdAt: "2026-02-01" },
  { id: "b2", tenantId: "t2", month: "2026-02", totalBill: 125758.87, isPaid: false, createdAt: "2026-02-01" },
  { id: "b3", tenantId: "t3", month: "2026-02", totalBill: 140507.72, isPaid: true, paidDate: "2026-02-15", createdAt: "2026-02-01" },
  { id: "b4", tenantId: "t4", month: "2026-02", totalBill: 118593.26, isPaid: false, createdAt: "2026-02-01" },
  { id: "b5", tenantId: "t5", month: "2026-02", totalBill: 31526.79, isPaid: false, createdAt: "2026-02-01" },
  { id: "b6", tenantId: "t6", month: "2026-02", totalBill: 10000.00, isPaid: true, paidDate: "2026-02-03", createdAt: "2026-02-01" },
  { id: "b7", tenantId: "t7", month: "2026-02", totalBill: 17000.00, isPaid: false, createdAt: "2026-02-01" },
  { id: "b8", tenantId: "t8", month: "2026-02", totalBill: 28777.77, isPaid: false, createdAt: "2026-02-01" },
  { id: "b9", tenantId: "t9", month: "2026-02", totalBill: 26750.00, isPaid: true, paidDate: "2026-02-01", createdAt: "2026-02-01" },
  { id: "b10", tenantId: "t10", month: "2026-02", totalBill: 24839.29, isPaid: false, createdAt: "2026-02-01" },
  { id: "b11", tenantId: "t11", month: "2026-02", totalBill: 17200.00, isPaid: false, createdAt: "2026-02-01" },
  { id: "b12", tenantId: "t12", month: "2026-02", totalBill: 10000.00, isPaid: false, createdAt: "2026-02-01" },
  { id: "b14", tenantId: "t14", month: "2026-02", totalBill: 25000.00, isPaid: false, createdAt: "2026-02-01" },
  { id: "b15", tenantId: "t15", month: "2026-02", totalBill: 25000.00, isPaid: false, createdAt: "2026-02-01" },
  { id: "b16", tenantId: "t16", month: "2026-02", totalBill: 5600.00, isPaid: false, createdAt: "2026-02-01" },
];

export function getTenants(): Tenant[] {
  const stored = localStorage.getItem(TENANTS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(TENANTS_KEY, JSON.stringify(defaultTenants));
  return defaultTenants;
}

export function saveTenants(tenants: Tenant[]) {
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
}

export function addTenant(tenant: Tenant) {
  const tenants = getTenants();
  tenants.push(tenant);
  saveTenants(tenants);
}

export function removeTenant(tenantId: string) {
  const tenants = getTenants().filter((t) => t.id !== tenantId);
  saveTenants(tenants);
  const bills = getBills().filter((b) => b.tenantId !== tenantId);
  saveBills(bills);
}

export function updateTenant(updatedTenant: Tenant) {
  const tenants = getTenants();
  const index = tenants.findIndex((t) => t.id === updatedTenant.id);
  if (index !== -1) {
    tenants[index] = updatedTenant;
    saveTenants(tenants);
  }
}

export function getBills(): BillRecord[] {
  const stored = localStorage.getItem(BILLS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(BILLS_KEY, JSON.stringify(defaultBills));
  return defaultBills;
}

export function saveBills(bills: BillRecord[]) {
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

export function addBill(bill: BillRecord) {
  const bills = getBills();
  bills.push(bill);
  saveBills(bills);
}

export function toggleBillStatus(billId: string) {
  const bills = getBills();
  const bill = bills.find((b) => b.id === billId);
  if (bill) {
    const newVal = !bill.isPaid;
    bill.isPaid = newVal;
    bill.paidDate = newVal ? new Date().toISOString().split("T")[0] : undefined;
    saveBills(bills);
  }
  return bills;
}

export function getTenantBills(tenantId: string): BillRecord[] {
  return getBills().filter((b) => b.tenantId === tenantId);
}

export function checkAndGenerateMonthlyBills() {
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM

  // Optimization: Check if we already generated bills for this month
  const LAST_CHECK_KEY = "adc_last_bill_gen";
  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);

  if (lastCheck === currentMonthStr) {
    // Already checked this month, skip heavy loop
    return;
  }

  const tenants = getTenants();
  const bills = getBills();
  const currentYear = today.getFullYear();

  // Define fallback start date if no lease start (e.g., system start)
  const systemStartDate = new Date("2024-01-01");

  let billsAdded = false;

  // Process existing past-year bills to set them as paid
  bills.forEach(bill => {
    const billYear = parseInt(bill.month.split('-')[0], 10);
    if (!isNaN(billYear) && billYear < currentYear && !bill.isPaid) {
      bill.isPaid = true;
      bill.paidDate = `${billYear}-12-31`; // Fallback paid date for past year bills
      billsAdded = true;
      console.log(`Updated PAST YEAR bill to paid for ${bill.tenantId} - ${bill.month}`);
    }
  });

  tenants.forEach(tenant => {
    // Determine start date for checking:
    // 1. Lease Start Date (if valid)
    // 2. Fallback to System Start Date
    let checkDate = new Date(tenant.leaseStart || systemStartDate);

    // Ensure we don't go back earlier than system start or reasonable past
    if (checkDate < systemStartDate) checkDate = systemStartDate;

    // Loop from checkDate month by month until Today
    // We clone the date to avoid modifying the original reference
    let iteratorDate = new Date(checkDate);
    iteratorDate.setDate(1); // Normalize to 1st of month to avoid overflow issues (e.g. Feb 30)

    while (iteratorDate <= today) {
      const iterMonthStr = iteratorDate.toISOString().slice(0, 7); // YYYY-MM
      const billYear = iteratorDate.getFullYear();

      // 1. Check Lease Validity for this specific month
      if (tenant.leaseStart && tenant.leaseEnd) {
        const start = new Date(tenant.leaseStart);
        const end = new Date(tenant.leaseEnd);
        // Strict check: The iterator month must be fully within or overlapping lease
        // Simplification: If 1st of month is after lease end, stop
        if (iteratorDate > end) break;
        // If 1st of month is before lease start, skip (though checkDate logic above handles start)
      }

      // 2. Check if bill already exists for this specific month
      const existingBill = bills.find(b => b.tenantId === tenant.id && b.month === iterMonthStr);

      if (!existingBill) {
        // 3. Create Bill
        const rentAmount = tenant.totalDue || tenant.rentGross || 0;
        const isPastYear = billYear < currentYear;

        const newBill: BillRecord = {
          id: `auto-${iterMonthStr}-${tenant.id}`,
          tenantId: tenant.id,
          month: iterMonthStr,
          totalBill: rentAmount,
          isPaid: isPastYear,
          paidDate: isPastYear ? `${billYear}-12-31` : undefined, // Mark backlog past year bills as paid
          createdAt: new Date().toISOString().split('T')[0] // Created "today" even if for past month
        };

        bills.push(newBill);
        billsAdded = true;
        console.log(`Generated BACKLOG bill for ${tenant.name} - ${iterMonthStr}`);
      }

      // Move to next month
      iteratorDate.setMonth(iteratorDate.getMonth() + 1);
    }
  });

  if (billsAdded) {
    saveBills(bills);
    console.log(`Finished generating monthly bills.`);
  }

  // Mark as checked for this month
  localStorage.setItem(LAST_CHECK_KEY, currentMonthStr);
}

// --- Calendar Events ---

const defaultHolidays: Omit<CalendarEvent, "id">[] = [
  { title: "New Year's Day", date: "*-01-01", type: "holiday" },
  { title: "Chinese New Year", date: "2026-02-17", type: "holiday" }, // Dynamic usually, fixed for 2026
  { title: "EDSA Revolution Anniversary", date: "*-02-25", type: "holiday" },
  { title: "Araw ng Kagitingan", date: "*-04-09", type: "holiday" },
  { title: "Maundy Thursday", date: "2026-04-02", type: "holiday" }, // Dynamic
  { title: "Good Friday", date: "2026-04-03", type: "holiday" }, // Dynamic
  { title: "Labor Day", date: "*-05-01", type: "holiday" },
  { title: "Independence Day", date: "*-06-12", type: "holiday" },
  { title: "National Heroes Day", date: "2026-08-31", type: "holiday" }, // Last Monday of Aug
  { title: "Bonifacio Day", date: "*-11-30", type: "holiday" },
  { title: "Christmas Day", date: "*-12-25", type: "holiday" },
  { title: "Rizal Day", date: "*-12-30", type: "holiday" },
  { title: "New Year's Eve", date: "*-12-31", type: "holiday" }
];

export function getEvents(): CalendarEvent[] {
  const stored = localStorage.getItem(EVENTS_KEY);
  const userEvents: CalendarEvent[] = stored ? JSON.parse(stored) : [];

  // Generate holidays for current and next year to cover view
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const holidays: CalendarEvent[] = [];

  years.forEach(year => {
    defaultHolidays.forEach((Holiday, index) => {
      let date = Holiday.date;
      if (date.startsWith("*-")) {
        date = `${year}${date.substring(1)}`;
      }
      holidays.push({
        id: `holiday-${year}-${index}`,
        title: Holiday.title,
        date: date,
        type: "holiday",
        description: "Public Holiday"
      });
    });

    // Payroll (15th and End of Month)
    for (let month = 0; month < 12; month++) {
      // 15th (Fallback to 14th if Sunday)
      const fifteenthDate = new Date(year, month, 15);

      // If Sunday (0), move to Saturday (14th)
      if (fifteenthDate.getDay() === 0) {
        fifteenthDate.setDate(fifteenthDate.getDate() - 1);
      }

      const fifteenthYear = fifteenthDate.getFullYear();
      const fifteenthMonth = String(fifteenthDate.getMonth() + 1).padStart(2, '0');
      const fifteenthDay = String(fifteenthDate.getDate()).padStart(2, '0');
      const fifteenthDateStr = `${fifteenthYear}-${fifteenthMonth}-${fifteenthDay}`;

      holidays.push({
        id: `payroll-${year}-${month}-15`,
        title: "Payroll",
        date: fifteenthDateStr,
        type: "payroll",
        description: "Staff Salaries Release"
      });

      // End of Month
      const endOfMonthDate = new Date(year, month + 1, 0);

      // If Sunday (0), move to Saturday
      if (endOfMonthDate.getDay() === 0) {
        endOfMonthDate.setDate(endOfMonthDate.getDate() - 1);
      }

      const endYear = endOfMonthDate.getFullYear();
      const endMonth = String(endOfMonthDate.getMonth() + 1).padStart(2, '0');
      const endDate = String(endOfMonthDate.getDate()).padStart(2, '0');
      const payrollDateStr = `${endYear}-${endMonth}-${endDate}`;

      holidays.push({
        id: `payroll-${year}-${month}-end`,
        title: "Payroll",
        date: payrollDateStr,
        type: "payroll",
        description: "Staff Salaries Release"
      });
    }
  });

  return [...holidays, ...userEvents];
}

export function saveEvents(events: CalendarEvent[]) {
  // We only save user events, not generated holidays
  const userEvents = events.filter(e => e.type !== 'holiday');
  localStorage.setItem(EVENTS_KEY, JSON.stringify(userEvents));
}

export function addEvent(event: CalendarEvent) {
  const stored = localStorage.getItem(EVENTS_KEY);
  const userEvents: CalendarEvent[] = stored ? JSON.parse(stored) : [];
  userEvents.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(userEvents));
}

export function deleteEvent(eventId: string) {
  const stored = localStorage.getItem(EVENTS_KEY);
  if (!stored) return;
  const userEvents: CalendarEvent[] = JSON.parse(stored);
  const filtered = userEvents.filter(e => e.id !== eventId);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
}
