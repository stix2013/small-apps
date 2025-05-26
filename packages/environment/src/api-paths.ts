export const paths = {
  faq: {
    all: '/api/data/faqs',
    categories: '/api/data/category/faqs'
  },
  country: {
    fetch: '/api/data/countries'
  },
  dataBundle: {
    order: '/api/msisdn/order/product',
    fetch: '/api/data/data-bundles',
    coverageFiltered: '/api/data/data-bundles/coverage/filter',
    coverage: '/api/data/data-bundles/coverage'
  },
  coverage: {
    all: '/api/data/data-bundles/coverages',
    network: '/api/data/data-bundles/coverages/networks',
    continent: '/api/data/data-bundles/coverages/continents'
  },
  home: {
    banner: '/api/data/banners/home'
  },
  contact: {
    post: '/api/contact'
  },
  user: {
    contact: '/api/contact'
  },
  register: {
    user: '/api/register',
    email: {
      resend: '/api/email/verify/resend'
    },
    otp: {
      request: '/api/register/otp/send',
      verify: '/api/register/otp/verify'
    }
  },
  check: {
    email: '/api/check/email',
    msisdn: '/api/check/msisdn'
  },
  auth: {
    csrf: '/yellow/csrf-cookie',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    user: '/api/auth/user',
    forgotPassword: '/api/password/forgot'
  },
  profile: {
    fetch: '/api/user/profile',
    update: '/api/user/profile'
  },
  customer: {
    fetch: '/api/user/numbers',
    info: '/api/msisdn',
    balance: '/api/msisdn/balance',
    dataUsage: '/api/customer/data-usages',
    dataBundles: '/api/msisdn/products',
    dataUsageGraph: '/api/customer/usage/graph',
    internetData: '/api/customer/internet-data',
    transactions: '/api/customer/transactions'
  }
}

export type ApiPaths = typeof paths
