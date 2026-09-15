export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
};

/**
 * Formats raw snake_case database status to human-readable label.
 * ONLY use this in JSX/render output (table cells, badges, display text).
 * NEVER pass the output of this function into a Supabase query or filter.
 */
export function formatStatus(status: string): string {
  if (!status) return '';
  return STATUS_LABELS[status.toLowerCase()] ?? status;
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  case_study: 'Case Study',
  news: 'News',
  lessons_hub: 'Lessons Hub',
  founder_playbook: 'Founder Playbook',
  trend_analysis: 'Trend Analysis',
  failure: 'Case Study',
  funding: 'Funding Alert',
  layoff: 'Layoff Tracker',
  lessons: 'Lessons Hub',
  guide: 'Founder Playbook',
};

/**
 * Formats raw snake_case content_type to human-readable label.
 * ONLY use this in JSX/render output.
 */
export function formatContentType(type: string): string {
  if (!type) return '';
  return CONTENT_TYPE_LABELS[type.toLowerCase()] ?? type;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  writer: 'Writer',
};

/**
 * Formats raw snake_case user role to human-readable label.
 * ONLY use this in JSX/render output.
 */
export function formatRole(role: string): string {
  if (!role) return 'Writer';
  return ROLE_LABELS[role.toLowerCase()] ?? role;
}

