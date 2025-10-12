import { apiClient, QueryParams } from './apiClient';
import { API_CONFIG } from './api-config';

export interface Currency {
  id: number;
  name: string;
  symbol: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  name: string;
  dial_code: string;
  alpha2: string;
  alpha3: string;
  created_at: string;
  updated_at: string;
}

export interface CountryCurrency {
  id: string;
  country: Country;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  company_reg_id: string | null;
  tin: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profit {
  id: string;
  currency: Currency;
  type: 'bulk_payment' | 'bank_transfer' | 'cashout' | 'mobile_money_collection' | 'mobile_money_disbursement' | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BulkPayment {
  id: string;
  currency: Currency;
  organization: Organization;
  profit: Profit;
  sheet: string | null;
  total_amount: number;
  reference: string;
  charge: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  currency: Currency;
  mode: 'mobile_money' | 'bank_transfer' | 'cashout' | null;
  amount: number;
  charge: number | null;
  status: 'pending' | 'successful' | 'failed' | null;
  created_at: string;
  updated_at: string;
  link?: string;
  profit?: string;
}

export interface Link {
  id: string;
  currency: Currency;
  bulk_payment: BulkPayment;
  transaction: Transaction;
  amount: number;
  url: string | null;
  beneficiary_name: string | null;
  beneficiary_email: string | null;
  beneficiary_phone_number: string | null;
  beneficiary_bank_name: string | null;
  beneficiary_bank_branch: string | null;
  beneficiary_account_number: string | null;
  expiry_date: string | null;
  verification_code: string | null;
  status: 'sent' | 'processed' | 'expired' | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  reason: string | null;
  amount: number;
  phone_number: string | null;
  status: 'pending' | 'successful' | 'failed' | null;
  message: string | null;
  charge: number;
  created_at: string;
  updated_at: string;
  currency: number | null;
  organization: string | null;
  profit: string | null;
}

export interface MoMoWithdraw {
  id: string;
  amount: number;
  phone_number: string | null;
  status: 'pending' | 'successful' | 'failed' | null;
  message: string | null;
  charge: number;
  created_at: string;
  updated_at: string;
  currency: number | null;
  organization: string | null;
  profit: string | null;
}

export interface ProfitConfiguration {
  id: string;
  currency: Currency;
  name: 'sms_fee' | 'whatsapp_fee' | 'cash_out_fee' | 'bank_transfer_fee' | 'mobile_money_disbursement_fee' | 'mobile_money_collection_fee' | null;
  fee: number | null;
  percentage: string | null;
  use_percentage: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface CreateBulkPaymentRequest {
  organization: string;
  total_amount: number;
}

export interface ProcessBulkPaymentRequest {
  link: string;
  verification_code: string;
  mode?: 'mobile_money' | 'bank_transfer' | 'cashout' | null;
}

export interface InitiateCollectionRequest {
  organization: string;
  amount: number;
  phone_number?: string | null;
  reason?: string | null;
}

export interface MobileMoneyWithdrawRequest {
  organization: string;
  amount: number;
  phone_number?: string | null;
}

export interface UpdateProfitConfigRequest {
  name?: 'sms_fee' | 'whatsapp_fee' | 'cash_out_fee' | 'bank_transfer_fee' | 'mobile_money_disbursement_fee' | 'mobile_money_collection_fee' | null;
  fee?: number | null;
  percentage?: string | null;
  use_percentage?: boolean;
  currency?: number | null;
  updated_by?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class PaymentService {
  async getCurrencies(params?: QueryParams): Promise<PaginatedResponse<Currency>> {
    return apiClient.get<PaginatedResponse<Currency>>(API_CONFIG.endpoints.payments.currency.list, params);
  }

  async getCurrency(id: number): Promise<Currency> {
    return apiClient.get<Currency>(API_CONFIG.endpoints.payments.currency.detail(id));
  }

  async getCountries(params?: QueryParams): Promise<PaginatedResponse<Country>> {
    return apiClient.get<PaginatedResponse<Country>>(API_CONFIG.endpoints.payments.country.list, params);
  }

  async getCountry(id: number): Promise<Country> {
    return apiClient.get<Country>(API_CONFIG.endpoints.payments.country.detail(id));
  }

  async getCountryCurrencies(params?: QueryParams): Promise<PaginatedResponse<CountryCurrency>> {
    return apiClient.get<PaginatedResponse<CountryCurrency>>(API_CONFIG.endpoints.payments.countryCurrency.list, params);
  }

  async getCountryCurrency(id: string): Promise<CountryCurrency> {
    return apiClient.get<CountryCurrency>(API_CONFIG.endpoints.payments.countryCurrency.detail(id));
  }

  async getBulkPayments(params?: QueryParams): Promise<PaginatedResponse<BulkPayment>> {
    return apiClient.get<PaginatedResponse<BulkPayment>>(API_CONFIG.endpoints.payments.bulkPayment.list, params);
  }

  async getBulkPayment(id: string): Promise<BulkPayment> {
    return apiClient.get<BulkPayment>(API_CONFIG.endpoints.payments.bulkPayment.detail(id));
  }

  async createBulkPayment(data: CreateBulkPaymentRequest): Promise<BulkPayment> {
    return apiClient.post<BulkPayment>(API_CONFIG.endpoints.payments.bulkPayment.create, data);
  }

  async checkBulkPayment(linkId: string): Promise<ApiResponse<Link & { phone_info_verification_results?: any }>> {
    return apiClient.get<ApiResponse<Link & { phone_info_verification_results?: any }>>(
      API_CONFIG.endpoints.payments.bulkPayment.check(linkId)
    );
  }

  async processBulkPayment(data: ProcessBulkPaymentRequest): Promise<ApiResponse<Link>> {
    return apiClient.post<ApiResponse<Link>>(API_CONFIG.endpoints.payments.bulkPayment.process, data);
  }

  async getLinks(params?: QueryParams): Promise<PaginatedResponse<Link>> {
    return apiClient.get<PaginatedResponse<Link>>(API_CONFIG.endpoints.payments.links.list, params);
  }

  async getLink(id: string): Promise<Link> {
    return apiClient.get<Link>(API_CONFIG.endpoints.payments.links.detail(id));
  }

  async getTransactions(params?: QueryParams): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(API_CONFIG.endpoints.payments.transactions.list, params);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(API_CONFIG.endpoints.payments.transactions.detail(id));
  }

  async getCollections(params?: QueryParams): Promise<PaginatedResponse<Collection>> {
    return apiClient.get<PaginatedResponse<Collection>>(API_CONFIG.endpoints.payments.collections.list, params);
  }

  async getCollection(id: string): Promise<Collection> {
    return apiClient.get<Collection>(API_CONFIG.endpoints.payments.collections.detail(id));
  }

  async initiateCollection(data: InitiateCollectionRequest): Promise<ApiResponse<Collection>> {
    return apiClient.post<ApiResponse<Collection>>(API_CONFIG.endpoints.payments.collections.initiate, data);
  }

  async getMoMoWithdraws(params?: QueryParams): Promise<PaginatedResponse<MoMoWithdraw>> {
    return apiClient.get<PaginatedResponse<MoMoWithdraw>>(API_CONFIG.endpoints.payments.momoWithdraws.list, params);
  }

  async getMoMoWithdraw(id: string): Promise<MoMoWithdraw> {
    return apiClient.get<MoMoWithdraw>(API_CONFIG.endpoints.payments.momoWithdraws.detail(id));
  }

  async mobileMoneyWithdraw(data: MobileMoneyWithdrawRequest): Promise<ApiResponse<MoMoWithdraw>> {
    return apiClient.post<ApiResponse<MoMoWithdraw>>(API_CONFIG.endpoints.payments.mobileMoneyWithdraw, data);
  }

  async getPhoneNumberInfo(phoneNumber: string): Promise<any> {
    return apiClient.get<any>(`/payments/mobile_money/phone_number_info/${phoneNumber}`);
  }

  async getProfits(params?: QueryParams): Promise<PaginatedResponse<Profit>> {
    return apiClient.get<PaginatedResponse<Profit>>(API_CONFIG.endpoints.payments.profits.list, params);
  }

  async getProfit(id: string): Promise<Profit> {
    return apiClient.get<Profit>(API_CONFIG.endpoints.payments.profits.detail(id));
  }

  async getProfitConfigurations(params?: QueryParams): Promise<PaginatedResponse<ProfitConfiguration>> {
    return apiClient.get<PaginatedResponse<ProfitConfiguration>>(API_CONFIG.endpoints.payments.profitConfig.list, params);
  }

  async getProfitConfiguration(id: string): Promise<ProfitConfiguration> {
    return apiClient.get<ProfitConfiguration>(API_CONFIG.endpoints.payments.profitConfig.detail(id));
  }

  async updateProfitConfiguration(id: string, data: UpdateProfitConfigRequest): Promise<ProfitConfiguration> {
    return apiClient.put<ProfitConfiguration>(API_CONFIG.endpoints.payments.profitConfig.update(id), data);
  }
}

export const paymentService = new PaymentService();
