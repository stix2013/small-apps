import { config } from 'dotenv'

config()

const argv = process.argv
const _path = argv[2] || __dirname

const ready = process.env.RETRIEVE_ALL === 'true' || false

const baseUrl = process.env.BASE_URL || 'https://admin.yellowmobile.nl'
const pathWebhook = process.env.PATH_WEBHOOK || '/api/cdr/webhook'

const simInnBaseUrl = process.env.SIMINN_API_BASE || 'https://api.siminn.is/serviceprovider'
const simInnApiPathPing = process.env.SIMINN_API_PATH_PING || '/ping'
const simInnUser = process.env.SIMINN_API_USER || ''
const simInnAuth = process.env.SIMINN_API_AUTH || ''
const simInnAuthType = process.env.SIMINN_API_AUTH_TYPE || 'Basic'
//
const simInnSMSBaseUrl = process.env.SIMINN_SMS_BASE || 'https://vasp.siminn.is'
const simInnSMSHealthcheck = process.env.SIMINN_SMS_HEALTHCHECK || '/smap/healthcheck'
const simInnSMSUser = process.env.SIMINN_SMS_USER || ''
const simInnSMSPassword = process.env.SIMINN_SMS_PASSWORD || ''

export default {
  path: process.env.WATCHER_PATH || _path,
  ready,
  baseUrl,
  pathWebhook,
  expressPort: process.env.EXPRESS_PORT || 3500,
  // SIM API
  simInnBaseUrl,
  simInnApiPathPing,
  simInnUser,
  simInnAuth,
  simInnAuthType,
  // SIM SMS
  simInnSMSBaseUrl,
  simInnSMSHealthcheck,
  simInnSMSUser,
  simInnSMSPassword
}
