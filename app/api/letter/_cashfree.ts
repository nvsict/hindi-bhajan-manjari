// Shared Cashfree helpers for the letter service (server only).
// Using your exact ENV variables: CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET

export const CF_BASE = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com";

export function cfHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": process.env.CASHFREE_CLIENT_ID || "",
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET || "",
  };
}

export async function cfFetch(path: string, init?: RequestInit) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  
  // 🌟 FIX: Ensuring '/pg' is included in the URL structure for Cashfree API
  const baseUrl = CF_BASE.endsWith('/pg') ? CF_BASE : `${CF_BASE}/pg`;

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { ...cfHeaders(), ...(init?.headers || {}) },
      cache: "no-store",
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}