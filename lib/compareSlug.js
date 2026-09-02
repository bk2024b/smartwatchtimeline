// Canonical, stable slug for a comparison pair: always sorted alphabetically
// by id, so only one URL ever exists per pair (avoids a-vs-b / b-vs-a
// showing up as two different pages to search engines).
export function buildComparisonSlug(idA, idB) {
  const [x, y] = [idA, idB].sort();
  return `${x}-vs-${y}`;
}

export function parseComparisonSlug(slug) {
  const parts = slug.split('-vs-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts;
}

export function isCanonicalSlug(slug) {
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return false;
  return buildComparisonSlug(parsed[0], parsed[1]) === slug;
}
