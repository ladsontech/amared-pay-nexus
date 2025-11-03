export const API_CONFIG = {
  baseURL: 'https://bulksrv.almaredagencyuganda.com/',
  endpoints: {
    auth: {
      login: 'auth/login/',
      logout: 'auth/logout/',
      changePassword: 'auth/password/change/',
      refresh: 'auth/token/refresh/',
      verify: 'auth/token/verify/'
    },
    user: {
      list: 'user/', // GET /user/ - list all users
      detail: (id: string) => `user/${id}/`, // GET /user/{id}/ - get user details
      userList: 'users/user/', // GET /users/user/ - list users (with /users/ prefix)
      userDetail: (id: string) => `users/user/${id}/` // GET /users/user/{id}/ - get user details
    },
    subAdmin: {
      create: 'users/sub_admin/', // POST /users/sub_admin/
      list: 'users/sub_admin_list/', // GET /users/sub_admin_list/
      search: 'users/search_sub_admins/', // GET /users/search_sub_admins/
      detail: (id: string) => `users/sub_admin_list/${id}/`, // GET /users/sub_admin_list/{id}/
      update: (id: string) => `users/update_sub_admin/${id}/`, // PUT /users/update_sub_admin/{id}/
      delete: (id: string) => `users/sub_admin/${id}/` // DELETE /users/sub_admin/{id}/
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
      transactionDetail: (id: string) => `/organizations/wallet_transaction/${id}/`,
      // Bill Payment endpoints
      billPayments: '/organizations/bill_payment/',
      billPaymentDetail: (id: string) => `/organizations/bill_payment/${id}/`,
      // Petty Cash Wallet endpoints
      pettyCashWallets: '/organizations/petty_cash_wallet/',
      pettyCashWalletDetail: (id: string) => `/organizations/petty_cash_wallet/${id}/`,
      // Petty Cash Transaction endpoints
      pettyCashTransactions: '/organizations/petty_cash_transaction/',
      pettyCashTransactionDetail: (id: string) => `/organizations/petty_cash_transaction/${id}/`,
      // Petty Cash Expense endpoints
      pettyCashExpenses: '/organizations/petty_cash_expense/',
      pettyCashExpenseDetail: (id: string) => `/organizations/petty_cash_expense/${id}/`,
      // Petty Cash Fund Request endpoints
      pettyCashFundRequests: '/organizations/petty_cash_fund_request/',
      pettyCashFundRequestDetail: (id: string) => `/organizations/petty_cash_fund_request/${id}/`
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
        send: 'users/otp/forgot_password/email/', // POST /users/otp/forgot_password/email/
        resend: 'users/otp/resend/email/', // POST /users/otp/resend/email/
        verify: 'users/otp/verify/email_address/', // POST /users/otp/verify/email_address/
        resetPassword: 'users/otp/reset_password/email_code/' // POST /users/otp/reset_password/email_code/
      },
      sms: {
        send: 'users/otp/forgot_password/sms/', // POST /users/otp/forgot_password/sms/
        resend: 'users/otp/resend/sms/', // POST /users/otp/resend/sms/
        verify: 'users/otp/verify/phone_number/', // POST /users/otp/verify/phone_number/
        resetPassword: 'users/otp/reset_password/sms_code/' // POST /users/otp/reset_password/sms_code/
      }
    },
    // Legacy OTP endpoints for backward compatibility
    _otp: {
      forgotPasswordEmail: '/otp/forgot_password/email/',
      forgotPasswordSMS: '/otp/forgot_password/sms/',
      resendEmail: '/otp/resend/email/',
      resendSMS: '/otp/resend/sms/',
      resetPasswordEmailCode: '/otp/reset_password/email_code/',
      resetPasswordSMSCode: '/otp/reset_password/sms_code/',
      verifyEmailAddress: '/otp/verify/email_address/',
      verifyPhoneNumber: '/otp/verify/phone_number/'
    }
  }
} as const;

export type ApiConfig = typeof API_CONFIG;
export type Endpoint = string | ((...args: any[]) => string);

