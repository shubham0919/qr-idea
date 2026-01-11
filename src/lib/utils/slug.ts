import { customAlphabet } from "nanoid";

// Use URL-safe characters for slugs
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  6
);

export function generateSlug(): string {
  return nanoid();
}

export function isValidSlug(slug: string): boolean {
  // Allow alphanumeric, hyphens, 3-50 characters
  const slugRegex = /^[a-zA-Z0-9-]{3,50}$/;
  return slugRegex.test(slug);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
