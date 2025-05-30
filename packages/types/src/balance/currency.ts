export type CurrencyType = 'USD' | 'EUR' | 'ISK' | 'GBR'

export interface Price {
  price: number;
  currency: CurrencyType;
}

export interface CurrencySymbol {
    currency: string;
    code: string;
    symbol: string |null;
}
