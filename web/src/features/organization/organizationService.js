const CORE_API_BASE_URL = (
  import.meta.env.VITE_CORE_API_BASE_URL || "http://localhost:3000"
)
  .trim()
  .replace(/\/+$/, "");

export async function getOrganizations(accessToken, options = {}) {
  if (!accessToken) {
    throw new Error("Authentication token is required.");
  }

  const response = await fetch(`${CORE_API_BASE_URL}/api/organizations`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Client-Type": "web",
      Authorization: `Bearer ${accessToken}`,
    },
    signal: options.signal,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Unable to load organizations (${response.status}).`,
    );
  }

  const organizations = data?.data?.organizations;

  if (!Array.isArray(organizations)) {
    throw new Error("Invalid organizations response from Core API.");
  }

  return organizations.map((membership) => ({
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    membershipId: membership.membershipId,
    role: membership.role,
    type: membership.role
      ? membership.role.charAt(0).toUpperCase() + membership.role.slice(1)
      : "Member",
    organization: membership.organization,
  }));
}
