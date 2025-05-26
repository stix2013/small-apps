import axios from 'axios'
//
import config from '@src/config'

const baseURL = `${config.simInnSMSBaseUrl}`

export const simInnSMS = axios.create({
  baseURL,
  // timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})
