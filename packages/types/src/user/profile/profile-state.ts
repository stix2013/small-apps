import type { ProfileAddress } from './profile-address'
import type { ProfileName } from './profile-name'

export interface ProfileState {
  id: number | null
  name: ProfileName
  dateOfBirth: string | null
  gender: Gender// Masculine, Feminine, Neuter, Common
  address: ProfileAddress
  contactNumber: string | null
  initEmail: string | null
  isFetching: boolean
  lastError: {
    code?: string | number
    message: string
  } | null
}
