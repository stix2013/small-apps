import type { ContinentCode } from '@yellow-mobile/types/app/continent';
import type { MapRegion } from '@yellow-mobile/types/map/region';
import type { WithFilter } from '@yellow-mobile/types/generic';
import type { CoverageNetwork } from '@yellow-mobile/types/pages/coverage';
import type { CountryCodeName } from '@yellow-mobile/types/app/country';
//
import { tabContinentsCoverage } from './tab-continents-coverage';
import { tabLettersCoverage } from './tab-letters-coverage';

const defaultRegionCode: MapRegion = { key: 'EU', region: '150', scale: '1x' };

export const searchContinentRegionCode = (
  continentName: ContinentCode,
): MapRegion => {
  if (!continentName) {
    return defaultRegionCode;
  }

  if (tabContinentsCoverage[continentName]) {
    return {
      key: continentName,
      region: tabContinentsCoverage[continentName].region,
      scale: tabContinentsCoverage[continentName].scale || '1x',
    };
  }

  return defaultRegionCode;
};

export const getCountryCoverageFilter = (id: string) => {
  if (Object.prototype.hasOwnProperty.call(tabLettersCoverage, id)) {
    return tabLettersCoverage[id].value;
  }

  return tabLettersCoverage.ad.value;
};

export const filterData = <T extends WithFilter<unknown, string>, K>(
  list: T[],
  filter: string,
): K[] => {
  if (list && Array.isArray(list) && list.length > 0) {
    return list.find(
      (item: T) =>
        (item.filter || '').toLowerCase() === (filter || '').toLowerCase(),
    )?.data as K[];
  }
  return [] as K[];
};

export const getCoverageBandCode = (band: string): number => {
  const strBand = band.trim() || '';
  if (strBand === '') {
    return 0;
  }

  return 1;
};

export const getCoverageInternetCode = (coverage: string): number => {
  const strCoverage = coverage.trim() || '';
  const coverages = strCoverage.split(' ');
  if (coverages.length > 0) {
    const internet = coverages[0].toUpperCase();

    if (internet === 'INTERNET') {
      return 2;
    }

    if (internet === 'LOCAL') {
      return 1;
    }
  }

  return 0;
};

export const makeCoverageTooltipHtml = (
  country: CoverageNetwork,
  baseFullUrl: string,
): string => {
  const { band, countryCode, countryName, coverage } = country;
  const isoCode = (countryCode || '').trim().toLowerCase() || 'is';
  const imgSrc = `${baseFullUrl}/img/flags/${isoCode}.svg`;

  const html = `<div class="p-2 text-left text-white bg-dark">
   <h3 class="font-bold text-yellow flex flex-row">
    <img src="${imgSrc}" class="map-view-flag" alt="${countryName}">${countryName}
   </h3>
   <p class="mb-0">Network band: ${band}</p>
   <p class="mb-0">Coverage: ${coverage}</p>
   </div>`;

  return html;
};

export const getCoverageContinents = (
  data: CoverageNetwork[],
  continent: ContinentCode | ContinentCode[],
): CoverageNetwork[] => {
  const list: ContinentCode[] = [];
  if (!Array.isArray(continent)) {
    list.push(continent);
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return [];
  }

  const result: CoverageNetwork[] = [];

  list.forEach((code: ContinentCode) => {
    const continentCode = (code || '').trim().toUpperCase();

    data
      .filter((item: CoverageNetwork) => {
        const itemContinentCode = (item.continentCode || '-')
          .trim()
          .toUpperCase();
        return itemContinentCode === continentCode;
      })
      .forEach((country: CoverageNetwork) => {
        result.push(country);
      });
  });

  return result;
};

export const sortString = (a: string, b: string): number => {
  const upperA = a.trim().toUpperCase();
  const upperB = b.trim().toUpperCase();

  if (upperA < upperB) {
    return -1;
  }
  if (upperA > upperB) {
    return 1;
  }

  return 0;
};

export const sortCountries = <T extends CountryCodeName>(
  countryA: T,
  countryB: T,
): number => {
  return sortString(countryA.countryName, countryB.countryName);
};

export const getCoverageCountries = <T extends CountryCodeName>(
  data: T[],
  filter: string,
  search = false,
): T[] => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return [];
  }
  let regexp: RegExp;

  if (!search) {
    regexp = new RegExp(`^[${filter}]`, 'igm');
  } else {
    regexp = new RegExp(`^${filter}`, 'igm');
  }

  const filteredData = data.filter((item: T) => {
    const name = item.countryName || '';
    const code = item.countryCode || '';
    return regexp.test(name) || regexp.test(code);
  });
  // .sort(sortCountries)

  return filteredData;
};

export const calculateChartData = (
  data: CoverageNetwork[],
  baseUrl: string,
) => {
  const result: Array<[string, number | string, string]> = [];
  data.forEach((country: CoverageNetwork) => {
    if (country && country.countryName) {
      result.push([
        // country.countryName.trim().toUpperCase(),
        country.countryCode.trim().toUpperCase(),
        getCoverageBandCode(country.band),
        makeCoverageTooltipHtml(country, baseUrl),
      ]);
    }
  });

  return [...result];
};
