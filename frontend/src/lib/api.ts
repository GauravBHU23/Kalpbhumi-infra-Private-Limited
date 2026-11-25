const API_URL = process.env.NEXT_PUBLIC_API_URL || "/backend-api";

function endpoint(path: string): string {
  const base = API_URL.replace(/\/+$/, "");
  const resource = path.replace(/^\/+|\/+$/g, "");
  return `${base}/${resource}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(endpoint(path), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export function apiPost(path: string, payload: unknown): Promise<Response> {
  return fetch(endpoint(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
}

export function publicAssetUrl(value: string): string {
  if (!value) return "";
  try {
    const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(value, origin);
    const localHost = ["localhost", "127.0.0.1", "testserver"].includes(url.hostname);
    if (url.pathname.startsWith("/media/") && (localHost || url.origin === origin || value.startsWith("/media/"))) {
      return `/backend-media${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value;
  }
  return value;
}
