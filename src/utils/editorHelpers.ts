// Shared helpers for editor pages (slug generation, validations)

export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function requireFields(obj: Record<string, any>, fields: string[]): string | null {
  for (const f of fields) {
    if (!obj[f] || (typeof obj[f] === 'string' && !obj[f].trim())) {
      return `${f} is required`;
    }
  }
  return null;
}

// Date helpers
export function isAfter(a?: string, b?: string): boolean {
  if (!a || !b) return true;
  return new Date(a) > new Date(b);
}