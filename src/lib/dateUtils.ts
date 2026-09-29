/**
 * Date formatting and updated-time qualification utilities.
 */

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Returns formatted "Updated {date}" string ONLY if updated_at exists
 * and is 24+ hours after published_at. Otherwise returns undefined.
 */
export function getUpdatedDateIfEligible(
  publishedAt: string | null | undefined,
  updatedAt: string | null | undefined
): string | undefined {
  if (!publishedAt || !updatedAt) return undefined;
  const pubTime = new Date(publishedAt).getTime();
  const upTime = new Date(updatedAt).getTime();
  if (isNaN(pubTime) || isNaN(upTime)) return undefined;

  if (upTime - pubTime >= TWENTY_FOUR_HOURS_MS) {
    return new Date(upTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return undefined;
}

/**
 * Checks whether updated_at is 24+ hours after published_at.
 */
export function isUpdatedEligible(
  publishedAt: string | null | undefined,
  updatedAt: string | null | undefined
): boolean {
  if (!publishedAt || !updatedAt) return false;
  const pubTime = new Date(publishedAt).getTime();
  const upTime = new Date(updatedAt).getTime();
  if (isNaN(pubTime) || isNaN(upTime)) return false;
  return upTime - pubTime >= TWENTY_FOUR_HOURS_MS;
}
