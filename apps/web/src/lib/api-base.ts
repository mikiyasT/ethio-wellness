/**
 * Where the browser sends API calls.
 * Production (https://app.ayzoncare.com) uses NEXT_PUBLIC_API_URL, the Railway origin.
 * /backend is only the laptop tunnel. A phone on the same Wi-Fi still uses port 4000.
 */
export function resolveApiBase(input: {
  configured: string;
  hostname: string | null;
  protocol: string | null;
  origin: string | null;
}): string {
  const configured = input.configured || "http://localhost:4000";
  if (!input.hostname) return configured;
  const host = input.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return configured;
  if (input.protocol === "https:" && host.endsWith(".trycloudflare.com") && input.origin) {
    return `${input.origin}/backend`;
  }
  if (input.protocol === "http:" && isPrivateLanHost(host)) {
    return `http://${host}:${portOf(configured)}`;
  }
  return configured;
}

function portOf(configured: string) {
  try {
    return new URL(configured).port || "4000";
  } catch {
    return "4000";
  }
}

function isPrivateLanHost(hostname: string) {
  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}
