import axios from 'axios'
//
import config from '@src/config'
export const simInnApi = axios.create({
  baseURL: config.simInnBaseUrl,
  // timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Consumer-Username': config.simInnUser,
    Authorization: `${config.simInnAuthType} ${config.simInnAuth}`
  }
})
