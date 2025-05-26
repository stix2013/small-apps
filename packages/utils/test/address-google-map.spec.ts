import { describe, expect, it } from 'vitest'
//
import type { Address } from '@yellow-mobile/types'
import { serializeAddressGoogleMap } from '../src/address-google-map'

describe('Test serializeAddressGoogleMap', () => {
  it.todo('Address', () => {
    const address: Address = {
      street: ['Street 1', 'Street 2'],
      city: 'City',
      country: 'Country',
      zip: 'zip code'
    }
    const serialAddress = serializeAddressGoogleMap(address)
    expect(serialAddress).toBeTypeOf('string')
  })
})
