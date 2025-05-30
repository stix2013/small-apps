import type { User } from '.'
import type { Register } from '../form'

export interface UserRegister {
  user: User
  token: string
}

export interface UserRegisterState {
  userData: Register
  errors: {[key:string]: string} | null
}
