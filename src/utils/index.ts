import { randomUUID } from "node:crypto";

export const newId = (): string => randomUUID();

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (v: string): boolean => EMAIL_RE.test(v.trim());

export function isUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:";
  } catch {
    return false;
  }
}

/** Small helper to collect validation problems, then throw them all at once. */
export class Validator {
  readonly issues: string[] = [];
  require(value: unknown, field: string): this {
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      this.issues.push(`${field} is required`);
    }
    return this;
  }
  maxLength(value: string | undefined, max: number, field: string): this {
    if (value && value.length > max) this.issues.push(`${field} must be at most ${max} characters`);
    return this;
  }
  check(condition: boolean, message: string): this {
    if (!condition) this.issues.push(message);
    return this;
  }
}

/** Months between two dates (whole months). */
export function monthsBetween(start: Date, end: Date): number {
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  );
}
