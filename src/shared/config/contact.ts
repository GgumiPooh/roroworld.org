export const DEFAULT_CONTACT_EMAIL = "contact@roroworld.org";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  process.env.CONTACT_EMAIL?.trim() ||
  DEFAULT_CONTACT_EMAIL;
