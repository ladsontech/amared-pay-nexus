/**
 * Generates a default avatar URL for an organization based on its name
 * Returns a data URI with SVG containing the organization's initials
 */
function getOrganizationAvatar(organization?: { name?: string } | null): string {
  // Generate default avatar with initials
  const name = organization?.name || 'Organization';
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .filter(char => /[A-Za-z]/.test(char))
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ORG';

  // Generate SVG avatar with initials using blue gradient
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563EB;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad)" rx="12"/>
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Gets the logo URL for an organization, with fallback to default avatar
 */
export function getOrganizationLogoUrl(organization?: { id?: string; logo?: string | null; name?: string } | null): string {
  if (!organization) {
    return getOrganizationAvatar(null);
  }

  // If organization has a logo URL, use it
  if (organization.logo) {
    // Check if it's already a full URL
    if (organization.logo.startsWith('http://') || organization.logo.startsWith('https://')) {
      return organization.logo;
    }
    // If it's a relative path or API endpoint, construct full URL
    const API_BASE_URL = "https://bulksrv.almaredagencyuganda.com";
    return `${API_BASE_URL}${organization.logo.startsWith('/') ? organization.logo : '/' + organization.logo}`;
  }

  // Fallback to generated avatar with organization name
  return getOrganizationAvatar(organization);
}

