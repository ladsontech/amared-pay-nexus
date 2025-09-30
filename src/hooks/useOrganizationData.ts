import { useState, useEffect } from 'react';

interface OrganizationStats {
  totalStaff: number;
  totalWalletBalance: number;
  monthlyTransactions: number;
  pendingApprovals: number;
  activeProjects: number;
  completedPayments: number;
}

interface OrganizationDetails {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  industry: string;
  establishedDate: string;
  taxId: string;
  bankAccounts: Array<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
  }>;
  wallets: Array<{
    id: string;
    name: string;
    balance: number;
    currency: string;
    status: 'active' | 'suspended';
  }>;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  position: string;
  avatar?: string;
  joinedDate: string;
  lastLogin: string;
  permissions: string[];
  organizationId: string;
}

export function useOrganizationData() {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // In a real app, these would be actual API calls
      // For demo purposes, we'll use mock data with realistic values
      
      setTimeout(() => {
        // Mock organization stats
        setStats({
          totalStaff: 24,
          totalWalletBalance: 15750000, // UGX 15.75M
          monthlyTransactions: 186,
          pendingApprovals: 8,
          activeProjects: 12,
          completedPayments: 1247
        });

        // Mock organization details
        setOrganization({
          id: 'org_001',
          name: 'Almared Agency Uganda',
          registrationNumber: 'REG/2020/AAU/001',
          address: 'Plot 15, Industrial Area, Kampala, Uganda',
          phone: '+256700123456',
          email: 'info@almaredagencyuganda.com',
          website: 'https://almaredagencyuganda.com',
          industry: 'Financial Technology',
          establishedDate: '2020-03-15',
          taxId: 'TIN-1000123456',
          bankAccounts: [
            {
              id: 'acc_001',
              bankName: 'Stanbic Bank Uganda',
              accountNumber: '9030012345678',
              accountName: 'Almared Agency Uganda Ltd',
              isDefault: true
            },
            {
              id: 'acc_002',
              bankName: 'Centenary Bank',
              accountNumber: '3100987654321',
              accountName: 'Almared Agency Uganda Ltd',
              isDefault: false
            }
          ],
          wallets: [
            {
              id: 'wallet_001',
              name: 'Main Wallet',
              balance: 12300000,
              currency: 'UGX',
              status: 'active'
            },
            {
              id: 'wallet_002',
              name: 'Petty Cash',
              balance: 850000,
              currency: 'UGX',
              status: 'active'
            },
            {
              id: 'wallet_003',
              name: 'Collections',
              balance: 2600000,
              currency: 'UGX',
              status: 'active'
            }
          ]
        });

        // Mock user profile
        setUserProfile({
          id: 'user_001',
          firstName: 'John',
          lastName: 'Mukasa',
          email: 'john.mukasa@almaredagencyuganda.com',
          phoneNumber: '+256700123456',
          role: 'Manager',
          department: 'Finance',
          position: 'Finance Manager',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          joinedDate: '2023-01-15',
          lastLogin: new Date().toISOString(),
          permissions: [
            'create_transactions',
            'approve_transactions', 
            'view_department_reports',
            'manage_staff',
            'view_financial_data',
            'export_reports',
            'manage_petty_cash',
            'approve_bulk_payments'
          ],
          organizationId: 'org_001'
        });

        setLoading(false);
      }, 1000); // Simulate API call delay

    } catch (err) {
      setError('Failed to load organization data');
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      // In a real app, this would make an API call
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to update profile' };
    }
  };

  return {
    stats,
    organization,
    userProfile,
    loading,
    error,
    refetch: fetchOrganizationData,
    updateUserProfile
  };
}