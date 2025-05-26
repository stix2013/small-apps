import { getFullPath } from '@yellow-mobile/utils'

const basePort = process.env.APP_BASE_PORT || 3000
const baseUrl = process.env.APP_BASE_URL || 'http://frontend.yellow.localhost'

const baseBackendUrl = process.env.APP_BASE_BACKEND_URL || 'http://backend.yellow.localhost'
const apiUrl = process.env.APP_BASE_API_URL || 'http://backend.yellow.localhost'

const baseFullUrl = getFullPath(baseUrl, basePort)
const verificationPaths = {
  email: '/register/verify/email',
  code: '/register/verify/code'
}

export default {
  basePort,
  baseUrl,
  baseBackendUrl,
  apiUrl,
  baseFullUrl,
  verificationPaths
}
