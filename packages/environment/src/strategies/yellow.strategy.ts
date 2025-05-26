import type { StrategyRecord } from "./types";

export default function ({ authUrl, apiPaths }: StrategyRecord) {
  return {
    // export default {
    provider: 'laravel/sanctum',
    url: authUrl,
    scheme: 'local',
    // scheme: 'cookie',
    endpoints: {
      csrf: {
        method: 'get',
        // url: '/yellow/csrf-cookie'
        url: apiPaths.auth.csrf
      },
      login: {
        method: 'post',
        // url: '/api/auth/login'
        url: apiPaths.auth.login
      },
      logout: {
        method: 'post',
        // url: '/api/auth/logout'
        url: apiPaths.auth.logout
      },
      user: {
        method: 'get',
        url: apiPaths.auth.user
      }
    },
    token: {
      property: 'token',
      type: 'Bearer',
      name: 'Authorization',
      maxAge: 1800
    },
    user: {
      property: 'data'
    },
    rewriteRedirects: true
  }
}
