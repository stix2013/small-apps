import type { TabContinent } from "@yellow-mobile/types/pages/coverage"

export const tabContinentsCoverage: TabContinent<string> = {
  AF: {
    id: "af",
    value: "AF",
    text: "Africa",
    region: "002",
  },
  AS: {
    id: "as",
    value: "AS",
    text: "Asia",
    region: "142",
  },
  EU: {
    id: "eu",
    value: "EU",
    text: "Europe",
    region: "150", // 150
  },
  NA: {
    id: "na",
    value: "NA",
    text: "North America",
    region: "019",
    scale: "2x",
  },
  OC: {
    id: "oc",
    value: "OC",
    text: "Oceania",
    region: "009",
  },
  SA: {
    id: "sa",
    value: "SA",
    text: "South America",
    region: "005",
  },
};
