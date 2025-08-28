import { API_CONFIG } from './api-config';
import { apiClient } from './apiClient';

export interface ProfitConfigUpdateRequest {
  name: 'sms_fee' | 'whatsapp_fee' | 'cash_out_fee' | string;
  fee: number;
  percentage: string;
  use_percentage: boolean;
  currency: number;
  updated_by: string; // UUID
}

class PaymentsService {
  // Currency
  listCurrencies<T = any>() {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.currency.list);
  }
  getCurrency<T = any>(id: string | number) {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.currency.detail(id));
  }

  // Country
  listCountries<T = any>() {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.country.list);
  }
  getCountry<T = any>(id: string | number) {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.country.detail(id));
  }

  // Country-Currency
  listCountryCurrency<T = any>() {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.countryCurrency.list);
  }
  getCountryCurrency<T = any>(id: string | number) {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.countryCurrency.detail(id));
  }

  // Profit configuration
  listProfitConfigs<T = any>() {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.profitConfig.list);
  }
  getProfitConfig<T = any>(id: string | number) {
    return apiClient.get<T>(API_CONFIG.endpoints.payments.profitConfig.detail(id));
  }
  updateProfitConfig<T = any>(id: string | number, payload: ProfitConfigUpdateRequest) {
    return apiClient.put<T>(API_CONFIG.endpoints.payments.profitConfig.update(id), payload);
  }
}

export const paymentsService = new PaymentsService();

