export type ContinentCode = 'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA'
export type ContinentName = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania'

export type ContinentRegion =
  '155' // western europe
  | '151' // eastern europe
  | '150' // europe
  | '143' // central asia
  | '151' // north asia
  | '034' // south asia
  | '142' // asia
  | '021' // north america
  | '005' // south america
  | '013' // central asia
  | '019' // americas
  | '002' // africa'
  | '053' // australia + new zealand
  | '009' // oceania

export interface Continent {
  code: ContinentCode;
  region: ContinentRegion;
  name: ContinentName;
}
