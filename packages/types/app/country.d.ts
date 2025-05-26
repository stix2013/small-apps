export interface Country {
 name: string;
 iso: string;
 lat: number;
 lng: number;
 zoom: number;
 enabled?: 0|1;
 cities: string[];
}

export interface CountryItem {
  id: number
  name: string
  code: string
  alpha2: string
  alpha3: string
  continentCode: string
}

export interface CountryCodeName {
  countryCode: string
  countryName: string
}
