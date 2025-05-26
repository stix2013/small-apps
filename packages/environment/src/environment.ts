import { paths as apiPaths } from './api-paths'
//
import urls from './urls'

const isDev = (
  process.env.APP_ENV === 'staging' ||
  process.env.NODE_ENV === 'development' ||
  process.env.APP_ENV === 'local'
)

const {
  basePort,
  baseUrl,
  baseBackendUrl,
  baseFullUrl,
  apiUrl,
  verificationPaths
} = urls

export const environment = {
  siteName: process.env.APP_NAME || 'Yellow Mobile',
  siteDescription: 'YellowMobile website',
  copyright: 'Copyright © Yellow Mobile',
  email: {
    support: process.env.EMAIL_SUPPORT || 'support@yellowmobile.nl'
  },
  authLogin: '/login',
  authRedirect: '/my-yellow/overview',
  isDev,
  modeEnv: process.env.NODE_ENV,
  apiUrl,
  apiPaths,
  myYellow: {
    title: 'My Yellow (DEV)'
  },
  baseUrl,
  basePort,
  baseRoute: '/',
  generateDir: 'dist',
  onlyHome: true,
  myYellowSpa: true,
  publicPath: false,
  authUrl: baseBackendUrl, // 'http://backend.yellow.test',
  authStrategy: 'yellow',

  axios: {
    debug: false
    // debug: process.env.APP_AXIOS_DEBUG || false
  },
  extractCSS: true,
  // endpoints,
  baseFullUrl,
  ipxProvider: process.env.IPX_PROVIDER,
  ipxBaseUrl: process.env.IPX_BASE_URL,
  ipxDomains: [
    'http://localhost:3100',
    baseFullUrl,
    baseBackendUrl
  ],
  verificationPaths
}
