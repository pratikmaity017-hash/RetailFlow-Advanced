import { useState } from "react";

import { OrganizationContext } from "./organizationContext";
import { getOrganizations } from "./organizationService";

export function OrganizationProvider({ children }) {
  const [organizations] = useState(() => getOrganizations());

  const [selectedOrganization, setSelectedOrganization] = useState(
    organizations[0] ?? null,
  );

  function selectOrganization(organizationId) {
    const organization = organizations.find(
      (item) => item.id === organizationId,
    );

    if (!organization) {
      return;
    }

    setSelectedOrganization(organization);
  }

  const value = {
    organizations,
    selectedOrganization,
    selectOrganization,
    isDemo: true,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
