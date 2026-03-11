/**
 * Maps team member names to profile images in /team images/
 * Add entries here when adding new team photos.
 */
const TEAM_IMAGE_MAP: Record<string, string> = {
  abdullah: '/team images/abdullah.jpeg',
  arhum: '/team images/Arhum.jpg',
  awais: '/team images/awais.jpeg',
  wara: '/team images/wara.jpeg',
};

/** Names like "Khair ul Wara" - match by containing substring */
const NAME_CONTAINS_MAP: Array<{ contains: string; image: string }> = [
  { contains: 'wara', image: '/team images/wara.jpeg' },
];

function normalizeName(name: string): string {
  return name.trim().toLowerCase().split(/\s+/)[0] ?? '';
}

/**
 * Get the profile image path for a team member by name.
 * Returns the mapped image if found, otherwise empty string.
 */
export function getTeamImageForName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  const lower = name.trim().toLowerCase();
  // Check contains-map first (e.g. "Khair ul Wara" -> wara.jpeg)
  for (const { contains, image } of NAME_CONTAINS_MAP) {
    if (lower.includes(contains)) return image;
  }
  const first = normalizeName(name);
  return TEAM_IMAGE_MAP[first] ?? '';
}

/**
 * Resolve image URL for a team member: use DB image if valid, else fallback to name-based mapping.
 */
export function resolveTeamMemberImage(dbImage: string | null | undefined, name: string): string {
  const img = String(dbImage ?? '').trim();
  if (img && img !== 'null' && img !== 'undefined') {
    return img;
  }
  return getTeamImageForName(name);
}
