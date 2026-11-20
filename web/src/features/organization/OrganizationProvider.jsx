import { useEffect, useState, useContext } from "react";

import { AuthContext } from "../auth/AuthContext";
import { OrganizationContext } from "./organizationContext";
import { getOrganizations } from "./organizationService";
import { verifyOrganizationIntegration } from "./organizationIntegrationService";

export function OrganizationProvider({ children }) {
  const { accessToken, isLoading: authLoading } = useContext(AuthContext);

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [integrationStatus, setIntegrationStatus] = useState("idle");
  const [integrationContext, setIntegrationContext] = useState(null);
  const [integrationError, setIntegrationError] = useState(null);

  // Load organizations from Core SaaS.
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!accessToken) {
      setOrganizations([]);
      setSelectedOrganization(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadOrganizations() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getOrganizations(accessToken, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setOrganizations(result);

        setSelectedOrganization((current) => {
          if (current && result.some((item) => item.id === current.id)) {
            return result.find((item) => item.id === current.id);
          }

          return result[0] ?? null;
        });
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setOrganizations([]);
        setSelectedOrganization(null);
        setError(err.message || "Unable to load organizations.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadOrganizations();

    return () => controller.abort();
  }, [accessToken, authLoading]);

  // Verify the selected organization through the Advanced backend.
  useEffect(() => {
    if (authLoading || isLoading) {
      return;
    }

    if (!accessToken || !selectedOrganization) {
      setIntegrationStatus("idle");
      setIntegrationContext(null);
      setIntegrationError(null);
      return;
    }

    const controller = new AbortController();

    async function verifySelectedOrganization() {
      setIntegrationStatus("checking");
      setIntegrationContext(null);
      setIntegrationError(null);

      try {
        const result = await verifyOrganizationIntegration(
          selectedOrganization.id,
          accessToken,
          { signal: controller.signal },
        );

        if (controller.signal.aborted) {
          return;
        }

        setIntegrationContext(result);
        setIntegrationStatus("verified");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setIntegrationContext(null);
        setIntegrationError(err.message || "Organization verification failed.");
        setIntegrationStatus("error");
      }
    }

    verifySelectedOrganization();

    return () => controller.abort();
  }, [accessToken, authLoading, isLoading, selectedOrganization]);

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

    isDemo: false,
    isLoading: authLoading || isLoading,
    error,

    integrationStatus,
    integrationContext,
    integrationError,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
