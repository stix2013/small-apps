export default function ({ apiPaths }: Record<string, any>) {
  return {
    token: {
      property: 'access_token'
    },
    user: {
      property: 'data'
    },
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
    }
  }
}
