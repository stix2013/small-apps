export interface StoreAddress {
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  lat: number;
  lng: number;
  enabled?: 0|1;
}
