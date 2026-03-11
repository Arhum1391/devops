/**
 * Map of normalized mentor names to their canonical static image paths.
 * Normalization:
 * - Lowercase
 * - Trimmed
 * - Collapse multiple spaces
 * - Typically use name before any `" - "` suffix
 */
const MENTOR_IMAGE_MAP: Record<string, string> = {
  'adnan': '/team dark/Adnan.png',
  'assassin': '/team dark/Assassin.png',
  'hamza ali': '/team dark/Hamza Ali.png',
  'hassan khan': '/team dark/Hassan Khan.png',
  'hassan tariq': '/team dark/Hassan Tariq.png',
  'm. usama': '/team dark/M. Usama.png',
  'm usama': '/team dark/M. Usama.png',
  'usama': '/team dark/M. Usama.png',
  'meower': '/team dark/Meower.png',
  'mohid': '/team dark/Mohid.png',
};

/**
 * Normalize a raw mentor name into a key usable in the map.
 */
const normalizeMentorName = (rawName: string): string => {
  if (!rawName) return '';

  // Use portion before any " - " suffix (e.g. "Adnan - Senior Analyst")
  const base = rawName.split(' - ')[0] ?? rawName;

  return base
    .trim()
    .toLowerCase()
    // Collapse multiple spaces to a single space
    .replace(/\s+/g, ' ');
};

/**
 * Get the canonical static image path for a mentor name.
 * Returns empty string if no specific mapping is found (no default image).
 */
export const getCanonicalMentorImagePath = (rawName: string | undefined | null): string => {
  if (!rawName) return '';

  const key = normalizeMentorName(rawName);
  if (!key) return '';

  return MENTOR_IMAGE_MAP[key] ?? '';
};


