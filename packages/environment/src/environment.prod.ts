import { environment as envDefault } from './environment'
import authStrategies from './strategies'

const environment = {
  ...envDefault,
  appEnv: 'prod',
  siteName: 'Yellow Mobile',
  myYellow: {
    title: 'My Yellow'
  },
  basePort: false,
  production: true,
  baseUrl: 'https://yellowmobile.nl',
  authUrl: 'https://yellowmobile.nl',
  apiUrl: 'https://yellowmobile.nl',
  myYellowSpa: false,
  baseRoute: '/',
  publicPath: '/assets/',
  generateDir: 'prod',
  isDev: false,
  axios: {
    debug: false
  },
  ipxDomains: [
    'https://site.yellowmobile.nl',
    'https://reseller.yellowmobile.nl',
    'https://admin.yellowmobile.nl',
    'https://yellowmobile.nl'
  ],
  appOrigins: 'https://yellowmobile.nl,https://www.yellowmobile.nl'
}

export const envProd = {
  ...environment,
  baseFullUrl: environment.baseUrl,
  strategies: authStrategies(environment)
}
