const API_URL = process.env.NEXT_PUBLIC_API_URL!;

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

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let error = "Unknown error";
    try {
      const data = await res.json();
      error = (data as { error?: string }).error || res.statusText;
    } catch {
      // kalau gagal parse JSON, fallback ke statusText
    }
    throw new Error(error);
  }

  // ✅ fix untuk response kosong (misalnya DELETE → 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

// 🔧 Helper method supaya lebih enak dipakai
export const api = {
  get: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: "GET" }, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      token
    ),

  put: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(
      path,
      { method: "PUT", body: JSON.stringify(body) },
      token
    ),

  patch: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(
      path,
      { method: "PATCH", body: JSON.stringify(body) },
      token
    ),

  delete: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: "DELETE" }, token),
};
