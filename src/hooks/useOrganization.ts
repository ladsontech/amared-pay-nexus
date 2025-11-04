import { useState, useEffect } from 'react';
import { organizationService, Staff, Organization, Wallet, WalletTransaction, PettyCashWallet, PettyCashTransaction, PettyCashExpense } from '@/services/organizationService';
import { paymentService, BulkPayment, Collection, MoMoWithdraw } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

export const useOrganization = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staff Management
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Organization Management
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Wallet Management
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);

  // Payments Management
  const [bulkPayments, setBulkPayments] = useState<BulkPayment[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [momoWithdraws, setMomoWithdraws] = useState<MoMoWithdraw[]>([]);

  // Petty Cash Management
  const [pettyCashWallets, setPettyCashWallets] = useState<PettyCashWallet[]>([]);
  const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>([]);
  const [pettyCashExpenses, setPettyCashExpenses] = useState<PettyCashExpense[]>([]);

  // Fetch staff for current organization
  const fetchStaff = async () => {
    if (!user?.organizationId) return;
    
    setStaffLoading(true);
    setError(null);
    
    try {
      const response = await organizationService.getStaffList({
        organization: user.organizationId,
        limit: 100
      });
      setStaff(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
      console.error('Error fetching staff:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  // Fetch current organization details
  const fetchOrganization = async () => {
    if (!user?.organizationId) {
      // For superusers without organizationId, use a default organization from user data if available
      if (user?.isSuperuser && user?.organization) {
        setOrganization({
          id: user.organization.id || 'default-org',
          name: user.organization.name || 'Organization',
          logo: null,
          address: user.organization.address || '',
          company_reg_id: '',
          tin: '',
          static_collection_link: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Organization);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const org = await organizationService.getOrganization(user.organizationId);
      setOrganization(org);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organization';
      setError(errorMessage);
      console.error('Error fetching organization:', err);
      // Don't throw - allow the app to continue with user.organization data
      // Set a default organization object from user data if available
      if (user.organization) {
        setOrganization({
          id: user.organizationId,
          name: user.organization.name || 'Organization',
          logo: null,
          address: user.organization.address || '',
          company_reg_id: '',
          tin: '',
          static_collection_link: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Organization);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallets for current organization
  const fetchWallets = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizationService.getWallets({
        organization: user.organizationId,
        limit: 10
      });
      setWallets(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
      console.error('Error fetching wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet transactions
  const fetchWalletTransactions = async (walletId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params: { limit: number; wallet?: string } = { limit: 50 };
      if (walletId) {
        params.wallet = walletId;
      } else if (user?.organizationId) {
        // Get transactions for all wallets in the organization
        const walletResponse = await organizationService.getWallets({
          organization: user.organizationId,
          limit: 10
        });
        if (walletResponse.results.length > 0) {
          params.wallet = walletResponse.results[0].id;
        }
      }

      const response = await organizationService.getWalletTransactions(params);
      setWalletTransactions(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching wallet transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bulk payments for current organization
  const fetchBulkPayments = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getBulkPayments({
        organization: user.organizationId,
        limit: 20
      });
      setBulkPayments(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bulk payments');
      console.error('Error fetching bulk payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch collections for current organization
  const fetchCollections = async (params?: { status?: string; limit?: number }) => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getCollections({
        organization: user.organizationId,
        status: params?.status,
        limit: params?.limit || 50
      });
      setCollections(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mobile money withdraws for current organization
  const fetchMomoWithdraws = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getMoMoWithdraws({
        organization: user.organizationId,
        limit: 20
      });
      setMomoWithdraws(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mobile money withdraws');
      console.error('Error fetching momo withdraws:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch petty cash wallets for current organization
  const fetchPettyCashWallets = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await organizationService.getPettyCashWallets({
        organization: user.organizationId,
        limit: 10
      });
      setPettyCashWallets(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch petty cash wallets');
      console.error('Error fetching petty cash wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch petty cash transactions for current organization
  const fetchPettyCashTransactions = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await organizationService.getPettyCashTransactions({
        limit: 50
      });
      setPettyCashTransactions(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch petty cash transactions');
      console.error('Error fetching petty cash transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch petty cash expenses for current organization
  const fetchPettyCashExpenses = async () => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await organizationService.getPettyCashExpenses({
        limit: 50
      });
      setPettyCashExpenses(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch petty cash expenses');
      console.error('Error fetching petty cash expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new staff member
  const addStaff = async (staffData: {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role?: "owner" | "manager" | "member";
  }) => {
    if (!user?.organizationId) throw new Error('No organization selected');
    
    setLoading(true);
    setError(null);
    
    try {
      const newStaff = await organizationService.addStaff({
        ...staffData,
        organization: user.organizationId
      });
      
      // Refresh staff list
      await fetchStaff();
      return newStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add staff member';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update staff role
  const updateStaffRole = async (staffId: string, role: "owner" | "manager" | "member") => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStaff = await organizationService.updateStaffRole(staffId, { role });
      
      // Update local state
      setStaff(prev => prev.map(s => s.id === staffId ? updatedStaff : s));
      return updatedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete staff member
  const deleteStaff = async (staffId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await organizationService.deleteStaff(staffId);
      
      // Update local state
      setStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete staff member';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update organization
  const updateOrganization = async (orgData: {
    name: string;
    address?: string;
    company_reg_id?: string;
    tin?: string;
  }) => {
    if (!user?.organizationId) throw new Error('No organization selected');
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedOrg = await organizationService.updateOrganization(user.organizationId, orgData);
      setOrganization(updatedOrg);
      return updatedOrg;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update wallet
  const updateWallet = async (walletId: string, walletData: {
    balance?: number;
    is_pin_set?: boolean;
    currency?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedWallet = await organizationService.updateWallet(walletId, {
        ...walletData,
        updated_by: user?.id
      });
      
      // Update local state
      setWallets(prev => prev.map(w => w.id === walletId ? updatedWallet : w));
      return updatedWallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when user changes
  useEffect(() => {
    if (user?.organizationId) {
      // During impersonation, make fetching non-blocking
      // If organization fetch fails, continue with user.organization data
      fetchOrganization().catch(err => {
        console.warn('Failed to fetch organization during impersonation:', err);
        // Continue without throwing - organization data from user object will be used
      });
      
      // Fetch other data - these are less critical and can fail silently during impersonation
      fetchStaff().catch(console.error);
      fetchWallets().catch(console.error);
      fetchWalletTransactions().catch(console.error);
      fetchBulkPayments().catch(console.error);
      fetchCollections().catch(console.error);
      fetchMomoWithdraws().catch(console.error);
      fetchPettyCashWallets().catch(console.error);
      fetchPettyCashTransactions().catch(console.error);
      fetchPettyCashExpenses().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  return {
    // State
    loading,
    error,
    staff,
    staffLoading,
    organization,
    organizations,
    wallets,
    walletTransactions,
    bulkPayments,
    collections,
    momoWithdraws,
    pettyCashWallets,
    pettyCashTransactions,
    pettyCashExpenses,

    // Actions
    fetchStaff,
    fetchOrganization,
    fetchWallets,
    fetchWalletTransactions,
    fetchBulkPayments,
    fetchCollections,
    fetchMomoWithdraws,
    fetchPettyCashWallets,
    fetchPettyCashTransactions,
    fetchPettyCashExpenses,
    addStaff,
    updateStaffRole,
    deleteStaff,
    updateOrganization,
    updateWallet,

    // Computed values
    totalStaff: staff.length,
    activeStaff: staff.filter(s => s.user.is_email_verified && s.user.is_phone_verified).length,
    totalWalletBalance: wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0),
    monthlyTransactions: walletTransactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() &&
             transactionDate.getFullYear() === now.getFullYear();
    }).length,
    pendingApprovals: walletTransactions.filter(t => t.type === 'debit' && !t.title?.includes('approved')).length
  };
};
