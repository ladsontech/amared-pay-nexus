export const API_CONFIG = {
  baseURL: (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://backendapi.bulkpay.almaredagencyuganda.com',
  endpoints: {
    auth: {
      login: '/users/auth/login/',
      logout: '/users/auth/logout/',
      changePassword: '/users/auth/password/change',
      refresh: '/users/auth/token/refresh/',
      verify: '/users/auth/token/verify/'
    },
    user: {
      list: '/users/user/',
      detail: (id: string) => `/users/user/${id}/`
    },
    subAdmin: {
      create: '/users/sub_admin/',
      list: '/users/sub_admin_list/',
      detail: (id: string) => `/users/sub_admin_list/${id}/`,
      update: (id: string) => `/users/update_sub_admin/${id}/`,
      delete: (id: string) => `/users/sub_admin/${id}/`,
      search: '/users/search_sub_admins/'
    },
    organizations: {
      createWithOwner: '/organizations/create_org/',
      list: '/organizations/org/',
      detail: (id: string) => `/organizations/org/${id}/`,
      update: (id: string) => `/organizations/org/${id}/`,
      addStaff: '/organizations/add_staff/',
      staff: '/organizations/staff/',
      staffDetail: (id: string) => `/organizations/staff/${id}/`,
      changeStaff: (id: string) => `/organizations/change_staff/${id}/`,
      wallets: '/organizations/wallet/',
      walletDetail: (id: string) => `/organizations/wallet/${id}/`,
      updateWallet: (id: string) => `/organizations/update_wallet/${id}/`,
      transactions: '/organizations/wallet_transaction/',
      transactionDetail: (id: string) => `/organizations/wallet_transaction/${id}/`
    },
    otp: {
      email: {
        send: '/otp/forgot_password/email/',
        resend: '/otp/resend/email/',
        verify: '/otp/verify/email_address/',
        resetPassword: '/otp/reset_password/email_code/'
      },
      sms: {
        send: '/otp/forgot_password/sms/',
        resend: '/otp/resend/sms/',
        verify: '/otp/verify/phone_number/',
        resetPassword: '/otp/reset_password/sms_code/'
      }
    },
    payments: {
      currency: {
        list: '/payments/currency/',
        detail: (id: string | number) => `/payments/currency/${id}/`
      },
      country: {
        list: '/payments/country/',
        detail: (id: string | number) => `/payments/country/${id}/`
      },
      countryCurrency: {
        list: '/payments/country_currency/',
        detail: (id: string | number) => `/payments/country_currency/${id}/`
      },
      profitConfig: {
        list: '/payments/profit_configuration/',
        detail: (id: string | number) => `/payments/profit_configuration/${id}/`,
        update: (id: string | number) => `/payments/change_profit_configuration/${id}/`
      }
    }
  }
} as const;

export type ApiConfig = typeof API_CONFIG;
export type Endpoint = string | ((...args: any[]) => string);

