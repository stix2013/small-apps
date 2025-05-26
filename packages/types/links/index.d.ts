export interface MetaDataAuth {
  requiresAuth: boolean
  roles?: string[] | string
}
export interface RouteLink {
  id: number
  weight: number
  title: string
  to?: string
  guard?: boolean
  meta?: MetaDataAuth
}

export interface RouteLinks {
  [key: string]: RouteLink
}

export interface MenuLink extends RouteLink {
  // title: string
  // to?: string
  icon?: string | string[]
  enabled?: boolean
  visible?: boolean
  visibleIfLogged?: boolean
  hideIfLogged?: boolean
}

export interface MenuLinks {
  [key: string]: MenuLink
}

export interface MenuGroup {
  left?: MenuLinks
  right?: MenuLinks
  copyright?: MenuLinks
  about?: MenuLinks
  contact?: MenuLinks
}

export interface LinkYellow {
  first: string
  to: string
  icon: string[]
  second?: string
  icons?: string[][]
  hash?: string
}

export interface LinkShowHide {
  showIfLogged: boolean;
  hideIfLogged: boolean;
}


export type LinkYellowWithoutTo = Omit<LinkYellow, 'to'>
export type LinkYellowWithHash = Pick<LinkYellow, 'first' | 'to' | 'hash'>
