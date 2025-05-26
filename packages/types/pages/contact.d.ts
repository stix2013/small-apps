import type { Address } from '../app/address'

export interface ContactSection {
  title: string;
}

export interface ContactSectionWrite extends ContactSection {
  address: Address;
}

export interface ContactSectionSupport extends ContactSection {
  email: string;
}

export interface ContactSectionReseller extends ContactSection {
  content: string;
}
