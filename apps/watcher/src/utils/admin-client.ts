import axios from 'axios'
import config from '@src/config'

export const adminClient = axios.create({
  baseURL: config.baseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})
