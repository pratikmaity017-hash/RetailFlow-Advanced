// Temporary data source.
// This will later be replaced with the approved Core RetailFlow API.

const demoOrganizations = [
  {
    id: "retailflow-demo",
    name: "RetailFlow Demo",
    type: "Demo organization",
  },
  {
    id: "northstar-retail",
    name: "Northstar Retail",
    type: "Demo organization",
  },
  {
    id: "citymart-demo",
    name: "CityMart Demo",
    type: "Demo organization",
  },
];

export function getOrganizations() {
  return demoOrganizations;
}
