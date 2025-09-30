export type PettyCashTransaction = {
  id: string;
  date: string; // YYYY-MM-DD
  type: "expense" | "addition";
  amount: number;
  description: string;
  category: string;
  status: "approved" | "pending" | "rejected";
  payee?: string;
};

export const pettyCashStartingFloat = 150000; // UGX

export const pettyCashTransactions: PettyCashTransaction[] = [
  // Some history before the visible month to enable opening balance calculation
  {
    id: "TXN000-A",
    date: "2024-05-28",
    type: "addition",
    amount: 80000,
    description: "Float top-up",
    category: "Cash Addition",
    status: "approved",
    payee: "Finance Department"
  },
  {
    id: "TXN000-B",
    date: "2024-06-01",
    type: "expense",
    amount: 12000,
    description: "Stationery before month start",
    category: "Office Supplies",
    status: "approved",
    payee: "Office Depot Uganda"
  },
  // Current month sample transactions (mirrors TransactionHistory.tsx)
  {
    id: "TXN001",
    date: "2024-06-12",
    type: "expense",
    amount: 2500,
    description: "Office supplies - printer paper",
    category: "Office Supplies",
    status: "approved",
    payee: "Office Depot Uganda"
  },
  {
    id: "TXN002",
    date: "2024-06-11",
    type: "addition",
    amount: 50000,
    description: "Monthly petty cash addition",
    category: "Cash Addition",
    status: "approved",
    payee: "Finance Department"
  },
  {
    id: "TXN003",
    date: "2024-06-10",
    type: "expense",
    amount: 5000,
    description: "Transport for office errands",
    category: "Travel & Transport",
    status: "pending",
    payee: "Uber Uganda"
  },
  {
    id: "TXN004",
    date: "2024-06-09",
    type: "expense",
    amount: 1200,
    description: "Tea and coffee for meeting",
    category: "Meals & Entertainment",
    status: "approved",
    payee: "Java House"
  },
  {
    id: "TXN005",
    date: "2024-06-08",
    type: "expense",
    amount: 15000,
    description: "Maintenance and repairs",
    category: "Maintenance",
    status: "approved",
    payee: "Fix-It Services"
  }
];

export type BulkPaymentReportItem = {
  id: string;
  amount: number;
  recipients: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string; // ISO
  description: string;
  recipientDetails: {
    successful: number;
    pending: number;
    failed: number;
    recipients: Array<{
      id: string;
      name: string;
      phoneNumber: string;
      amount: number;
      status: "successful" | "pending" | "failed";
      reason?: string;
    }>;
  };
};

export const bulkPaymentReportData: BulkPaymentReportItem[] = [
  {
    id: "BP001",
    amount: 250000,
    recipients: 150,
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    description: "Monthly Salary Payment",
    recipientDetails: {
      successful: 145,
      pending: 2,
      failed: 3,
      recipients: [
        { id: "R001", name: "John Doe", phoneNumber: "+256701234567", amount: 1500, status: "successful" },
        { id: "R002", name: "Jane Smith", phoneNumber: "+256709876543", amount: 1600, status: "successful" },
        { id: "R003", name: "Bob Wilson", phoneNumber: "+256705555555", amount: 1400, status: "pending" },
        { id: "R004", name: "Alice Brown", phoneNumber: "+256708888888", amount: 1700, status: "failed", reason: "Invalid account" },
        { id: "R005", name: "David Johnson", phoneNumber: "+256707777777", amount: 1550, status: "successful" }
      ]
    }
  },
  {
    id: "BP002",
    amount: 75000,
    recipients: 50,
    status: "processing",
    createdAt: "2024-01-14T14:20:00Z",
    description: "Vendor Payments Q1",
    recipientDetails: {
      successful: 32,
      pending: 15,
      failed: 3,
      recipients: [
        { id: "V001", name: "Tech Solutions Ltd", phoneNumber: "+256701111111", amount: 1500, status: "successful" },
        { id: "V002", name: "Office Supplies Co", phoneNumber: "+256702222222", amount: 1200, status: "pending" },
        { id: "V003", name: "Catering Services", phoneNumber: "+256703333333", amount: 1800, status: "failed", reason: "Network timeout" },
        { id: "V004", name: "Security Company", phoneNumber: "+256704444444", amount: 2000, status: "successful" }
      ]
    }
  },
  {
    id: "BP003",
    amount: 180000,
    recipients: 120,
    status: "pending",
    createdAt: "2024-01-13T09:15:00Z",
    description: "Commission Payments",
    recipientDetails: {
      successful: 0,
      pending: 120,
      failed: 0,
      recipients: [
        { id: "C001", name: "Sales Agent 1", phoneNumber: "+256705555555", amount: 1500, status: "pending" },
        { id: "C002", name: "Sales Agent 2", phoneNumber: "+256706666666", amount: 1400, status: "pending" },
        { id: "C003", name: "Sales Agent 3", phoneNumber: "+256707777777", amount: 1600, status: "pending" }
      ]
    }
  }
];

export type CollectionReportItem = {
  id: string;
  amount: number;
  phoneNumber: string;
  status: "pending" | "successful" | "failed";
  method: "mobile_money" | "bank_transfer";
  createdAt: string; // ISO
  reference: string;
  currency: string;
};

export const collectionReportData: CollectionReportItem[] = [
  {
    id: "COL001",
    amount: 50000,
    phoneNumber: "+256701234567",
    status: "successful",
    method: "mobile_money",
    createdAt: "2024-01-15T10:30:00Z",
    reference: "REF001",
    currency: "UGX"
  },
  {
    id: "COL002",
    amount: 25000,
    phoneNumber: "+256789012345",
    status: "pending",
    method: "mobile_money",
    createdAt: "2024-01-14T14:20:00Z",
    reference: "REF002",
    currency: "UGX"
  }
];