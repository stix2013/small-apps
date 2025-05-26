export interface ValidateItem {
  dirty: boolean,
  validated: boolean,
  valid: any
}

export interface Login {
  email: null | string;
  password: null | string;
}

export interface ForgotPass {
  email: null | string;
  mobile: null | string;
}

export interface Register {
  name: null | string;
  email: null | string;
  // emailConfirmation: null | string;
  password: null | string;
  // passwordConfirmation: null | string;
  mobile: null | string;
}

export interface RegisterConfirmation {
  emailConfirmation: null | string
  passwordConfirmation: null | string

}

export type RegisterWithConfirmation = Register & RegisterConfirmation

export interface RegisterGuest {
  email: null | string;
  emailConfirmation: null | string;
  mobile: null | string;
  mobileConfirmation: null | string;
}

export interface OrderSimForm {
  name: null | string;
  surname: null | string;
  street: null | string;
  number: null | string;
  postal: null | string;
  city: null | string;
  country: null | string;
  state: null | string;
  mail: null | string;
  agreed: false | boolean;
}

export interface AccountChangeMail {
  id: null | number;
  mail: null | string;
  mailConfirmation: null | string;
  password: null | string;
}

export interface PaymentMethodForm {
  paytype: null | string;
  cardtype: null | string;
  name: null | string;
  number: null | string;
  secnum: null | string;
  validmonth: null | string;
  validyear: null | string;
  changeable: false | boolean;
  isDefault: false | boolean;
}

export interface BuyBundleForm {
  number: null | string;
  bundle: null | string;
  bundleType: null | string;
  validFor: null | string;
  internet: null | string;
  price: null | string;
  paymentMethod: null | string;
}

export type ResellerPartnership = null | 'Business' | 'Partnership' | 'Sponsorship' | 'Events'

export interface Reseller {
  firstName: null | string;
  lastName: null | string;
  companyName: null | string;
  phone: null | string;
  email: null | string;
  tax?: null | string;
  address?: null | string;
  postal?: null | string;
  country?: null | string;
  partnershipType: ResellerPartnership;
  dateOfEvent: null | string;
  message?: string;
}

export interface TopUpForm {
  type: string;
  auto: string;
  number: string;
  number2: string;
  amount: string;
  amounts: Array<string>;
  otherAmount: string;
  method: string;
  gift: boolean;
  voucher: Array<string>;
}

export interface ContactForm {
  fullName: null | string;
  email: null | string;
  phone: null | string;
  // message: null | string;
  message: string | number | string[] | undefined
}

export interface RegisterStep2 {
  verify: null | string;
  yellowOffers: boolean;
  otherOffers: boolean;
}

export interface ActivationForm {
  msisdn: null | string
  sim: null | string
  otp: null | string
}

export interface ProfileForm {
  first: null | string;
  middle?: null | string;
  surname: null | string;
  fullname: null | string;
  dob: null | string;
  gender: null | string;
  street: null | string;
  number: null | string;
  city: null | string;
  postal: null | string;
  province?: null | string;
  country: null | string;
  email: null | string;
  phone: null | string;
}
