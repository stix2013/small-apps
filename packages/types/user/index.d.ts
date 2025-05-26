export interface User {
  id: number
  name: string
  email: string
  msisdn: string
  status: boolean
  verifiedEmail: boolean
  verifiedMsisdn: boolean
  mustChangePassword: boolean
}

export interface Auth {
  busy: boolean
  loggedIn: boolean
  strategy: string
  redirect: any
  user: User | null
}
