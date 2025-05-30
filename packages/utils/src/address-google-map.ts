import type { Address } from '@yellow-mobile/types/src/app/address'

export function serializeAddressGoogleMap (
  address: Pick<Address, 'street' | 'city' | 'country'>,
  charSeparator = '+',
  charJoin = ','
): string {
  const street = address.street.join(charJoin)
  const city = address.city
  const country = address.country

  // join with '+'
  return [country, city, street].join(charSeparator)
}
