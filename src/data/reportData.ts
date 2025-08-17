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
};

export const bulkPaymentReportData: BulkPaymentReportItem[] = [
  {
    id: "BP001",
    amount: 250000,
    recipients: 150,
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    description: "Monthly Salary Payment"
  },
  {
    id: "BP002",
    amount: 75000,
    recipients: 50,
    status: "processing",
    createdAt: "2024-01-14T14:20:00Z",
    description: "Vendor Payments Q1"
  },
  {
    id: "BP003",
    amount: 180000,
    recipients: 120,
    status: "pending",
    createdAt: "2024-01-13T09:15:00Z",
    description: "Commission Payments"
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