const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ⏱️ helper untuk timeout
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 10000, ...rest } = options; // default 10 detik
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(resource, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let error = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      error = (data as { error?: string }).error || res.statusText;
    } catch {
      try {
        const text = await res.text();
        if (text) error = text;
      } catch {
        // fallback ke statusText
      }
    }
    throw new Error(error);
  }

  // ✅ fix untuk response kosong (misalnya DELETE → 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  // coba parse JSON, kalau gagal fallback ke teks
  try {
    return (await res.json()) as T;
  } catch {
    return (await res.text()) as unknown as T;
  }
}

// 🔧 Helper supaya lebih enak dipakai
export const api = {
  get: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: "GET" }, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }, token),

  put: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }, token),

  patch: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token),

  delete: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: "DELETE" }, token),
};
