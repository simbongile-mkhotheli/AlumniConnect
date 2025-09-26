/**
 * UI utility functions for styling and display
 */

/**
 * Get CSS class for status badges based on status value
 * @param status - Status value
 * @returns CSS class name for the status badge
 */
export function getStatusBadgeClass(status: string): string {
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case 'active':
    case 'published':
    case 'approved':
    case 'completed':
    case 'success':
      return 'status-active';

    case 'inactive':
    case 'draft':
    case 'pending':
    case 'review':
      return 'status-pending';

    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'error':
      return 'status-cancelled';

    case 'scheduled':
    case 'upcoming':
    case 'planned':
      return 'status-scheduled';

    case 'expired':
    case 'archived':
    case 'closed':
      return 'status-expired';

    case 'featured':
    case 'highlighted':
    case 'priority':
      return 'status-featured';

    case 'paused':
    case 'suspended':
    case 'hold':
      return 'status-paused';

    default:
      return 'status-default';
  }
}

/**
 * Get CSS class for priority levels
 * @param priority - Priority level
 * @returns CSS class name for the priority
 */
export function getPriorityClass(priority: string): string {
  const priorityLower = priority.toLowerCase();

  switch (priorityLower) {
    case 'high':
    case 'urgent':
    case 'critical':
      return 'priority-high';

    case 'medium':
    case 'normal':
      return 'priority-medium';

    case 'low':
    case 'minor':
      return 'priority-low';

    default:
      return 'priority-normal';
  }
}

/**
 * Get CSS class for tier levels (sponsors, partners, etc.)
 * @param tier - Tier level
 * @returns CSS class name for the tier
 */
export function getTierClass(tier: string): string {
  const tierLower = tier.toLowerCase();

  switch (tierLower) {
    case 'platinum':
      return 'tier-platinum';

    case 'gold':
      return 'tier-gold';

    case 'silver':
      return 'tier-silver';

    case 'bronze':
      return 'tier-bronze';

    case 'premium':
    case 'pro':
      return 'tier-premium';

    case 'basic':
    case 'standard':
      return 'tier-basic';

    default:
      return 'tier-default';
  }
}

/**
 * Get CSS class for role badges
 * @param role - User role
 * @returns CSS class name for the role
 */
export function getRoleClass(role: string): string {
  const roleLower = role.toLowerCase();

  switch (roleLower) {
    case 'admin':
    case 'administrator':
      return 'role-admin';

    case 'mentor':
    case 'coach':
      return 'role-mentor';

    case 'alumni':
    case 'graduate':
      return 'role-alumni';

    case 'student':
    case 'mentee':
      return 'role-student';

    case 'partner':
    case 'sponsor':
      return 'role-partner';

    case 'moderator':
      return 'role-moderator';

    default:
      return 'role-default';
  }
}

/**
 * Get display text for status values
 * @param status - Status value
 * @returns Human-readable status text
 */
export function getStatusText(status: string): string {
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'pending':
      return 'Pending';
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    case 'expired':
      return 'Expired';
    case 'archived':
      return 'Archived';
    case 'featured':
      return 'Featured';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'paused':
      return 'Paused';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format numbers with appropriate suffixes (K, M, B)
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['', 'K', 'M', 'B', 'T'];

  const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k));

  if (i === 0) return num.toString();

  return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

/**
 * Generate initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials;
}

/**
 * Generate a color based on a string (useful for avatars, badges, etc.)
 * @param str - String to generate color from
 * @param saturation - Color saturation (0-100, default: 70)
 * @param lightness - Color lightness (0-100, default: 50)
 * @returns HSL color string
 */
export function stringToColor(
  str: string,
  saturation: number = 70,
  lightness: number = 50
): string {
  if (!str) return `hsl(0, ${saturation}%, ${lightness}%)`;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Check if a color is light or dark (useful for determining text color)
 * @param color - Color in hex format (#ffffff) or rgb format
 * @returns True if the color is light, false if dark
 */
export function isLightColor(color: string): boolean {
  let r: number, g: number, b: number;

  if (color.startsWith('#')) {
    // Hex color
    const hex = color.slice(1);
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    // RGB color
    const matches = color.match(/\d+/g);
    if (!matches || matches.length < 3) return true;
    [r, g, b] = matches.map(Number);
  } else {
    return true; // Default to light for unknown formats
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Generate CSS classes string from an object
 * @param classes - Object with class names as keys and boolean values
 * @returns Space-separated class names string
 */
export function classNames(classes: Record<string, boolean>): string {
  return Object.entries(classes)
    .filter(([, isActive]) => isActive)
    .map(([className]) => className)
    .join(' ');
}

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
