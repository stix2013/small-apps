export interface PayloadMsisdn {
  msisdn: string
}

export interface PayloadMsisdnForced extends PayloadMsisdn {
  forced?: boolean
}
