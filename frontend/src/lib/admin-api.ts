// Client helper for the staff-only Django JSON API (proxied same-origin via next.config rewrites).
const ADMIN_BASE = "/backend-api/admin";

export class AdminApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

async function csrfToken(): Promise<string> {
  let token = readCookie("csrftoken");
  if (!token) {
    await fetch(`${ADMIN_BASE}/auth/csrf`, { credentials: "same-origin", cache: "no-store" });
    token = readCookie("csrftoken");
  }
  return token;
}

function flattenErrors(data: unknown): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  let message = "";
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const text = Array.isArray(value) ? value.map(String).join(" ") : typeof value === "string" ? value : JSON.stringify(value);
      if (key === "detail" || key === "non_field_errors") message = text;
      else fields[key] = text;
    }
  } else if (Array.isArray(data)) {
    message = data.map(String).join(" ");
  }
  if (!message && Object.keys(fields).length) message = "Please fix the highlighted fields.";
  return { message, fields };
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

export async function adminFetch<T = unknown>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let payload: BodyInit | undefined;
  if (method !== "GET") headers["X-CSRFToken"] = await csrfToken();
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const [resource, query] = path.replace(/^\/+/, "").split("?");
  const url = `${ADMIN_BASE}/${resource.replace(/\/+$/, "")}${query ? `?${query}` : ""}`;
  let response: Response;
  try {
    response = await fetch(url, { method, headers, body: payload, credentials: "same-origin", cache: "no-store" });
  } catch {
    throw new AdminApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const { message, fields } = flattenErrors(data);
    const fallback = response.status === 413 ? "The file is too large." : `Request failed (${response.status}).`;
    throw new AdminApiError(message || fallback, response.status, fields);
  }
  return data as T;
}

/** Builds a multipart body; File values are sent as uploads, null/undefined as empty strings. */
export function toFormData(values: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value instanceof File) form.append(key, value);
    else if (typeof value === "boolean") form.append(key, value ? "true" : "false");
    else form.append(key, value === null || value === undefined ? "" : String(value));
  }
  return form;
}

export type AdminRole = "admin" | "staff" | "pending" | "disabled";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  phone: string;
  designation: string;
  role: AdminRole;
  date_joined: string;
  last_login: string | null;
};
