export interface UserNumber {
  id: number
  msisdn: string
  balance: number | string
  verifiedMsisdn: boolean
  customerCode: string
  isBlocked: boolean
  status: boolean
  msisdnVerifiedAt: string
  createdAt: string
}
