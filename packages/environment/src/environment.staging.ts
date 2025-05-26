// import { getFullPath } from '@yellow-mobile/utils'
import { environment as envDefault } from './environment'
import authStrategies from './strategies'

const apiPaths = {
  ...envDefault.apiPaths,
  coverage: {
    all: '/api/data/coverages',
    network: '/api/data/coverages/networks',
    continent: '/api/data/coverages/continents'
  }
}

const environment = {
  ...envDefault,
  appEnv: 'staging',
  siteName: 'Yellow Mobile',
  myYellow: {
    title: 'My Yellow'
  },
  baseUrl: 'https://site.yellowmobile.nl',
  authUrl: 'https://site.yellowmobile.nl',
  apiUrl: 'https://site.yellowmobile.nl',
  basePort: process.env.APP_BASE_PORT,
  generateDir: 'staging',
  baseRoute: '/',
  publicPath: '/assets/',
  myYellowSpa: false,
  extractCSS: false,
  // isDev: false,
  ipxProvider: process.env.IPX_PROVIDER || 'ipx',
  axios: {
    debug: false
  },
  ipxDomains: [
    'http://localhost:3100',
    'https://site.yellowmobile.nl'
  ],
  appOrigins: 'https://yellowmobile.nl,https://site.yellowmobile.nl',
  apiPaths
}

export const envStaging = {
  ...environment,
  baseFullUrl: 'https://site.yellowmobile.nl', // getFullPath(environment.baseUrl, environment.basePort),
  strategies: authStrategies(environment)
}
