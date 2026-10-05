export function ensureEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export function getEnv(name: string, fallback = ""): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}
