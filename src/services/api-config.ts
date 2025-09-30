export const API_CONFIG = {
  baseURL: 'https://bulksrv.almaredagencyuganda.com/',
  endpoints: {
    auth: {
      login: 'users/auth/login/',
      logout: 'users/auth/logout/',
      changePassword: 'users/auth/password/change/',
      refresh: 'users/auth/token/refresh/',
      verify: 'users/auth/token/verify/'
    },
    user: {
      list: 'user/',
      detail: (id: string) => `user/${id}/`,
      userList: 'users/user/',
      userDetail: (id: string) => `users/user/${id}/`
    },
    subAdmin: {
      create: 'users/sub_admin/',
      list: 'users/sub_admin_list/',
      search: 'users/search_sub_admins/',
      detail: (id: string) => `users/sub_admin_list/${id}/`,
      update: (id: string) => `users/update_sub_admin/${id}/`,
      delete: (id: string) => `users/sub_admin/${id}/`
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
    payments: {
      bulkPayment: {
        list: '/payments/bulk_payment/',
        detail: (id: string) => `/payments/bulk_payment/${id}/`,
        create: '/payments/create_bulk_payment/',
        process: '/payments/process_bulk_payment/transaction',
        check: (linkId: string) => `/payments/check_bulk_payment/${linkId}/`
      },
      collections: {
        list: '/payments/collections/',
        detail: (id: string) => `/payments/collections/${id}/`,
        initiate: '/payments/mobile_money/initiate_collection'
      },
      mobileMoneyWithdraw: '/payments/mobile_money/withdraw',
      momoWithdraws: {
        list: '/payments/momo_withdraws/',
        detail: (id: string) => `/payments/momo_withdraws/${id}/`
      },
      links: {
        list: '/payments/link/',
        detail: (id: string) => `/payments/link/${id}/`
      },
      transactions: {
        list: '/payments/transaction/',
        detail: (id: string) => `/payments/transaction/${id}/`
      },
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
      },
      profits: {
        list: '/payments/profit/',
        detail: (id: string) => `/payments/profit/${id}/`
      }
    },
    otp: {
      email: {
        send: 'users/otp/forgot_password/email/',
        resend: 'users/otp/resend/email/',
        verify: 'users/otp/verify/email_address/',
        resetPassword: 'users/otp/reset_password/email_code/'
      },
      sms: {
        send: 'users/otp/forgot_password/sms/',
        resend: 'users/otp/resend/sms/',
        verify: 'users/otp/verify/phone_number/',
        resetPassword: 'users/otp/reset_password/sms_code/'
      }
    }
  }
} as const;

export type ApiConfig = typeof API_CONFIG;
export type Endpoint = string | ((...args: any[]) => string);

