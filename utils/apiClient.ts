// utils/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { body, headers, ...rest } = options;

  const fetchOptions: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    credentials: "include", // Preserving cookie auth
  };

  if (body && typeof body !== "string") {
    fetchOptions.body = JSON.stringify(body);
  } else if (body) {
    fetchOptions.body = body;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "API request failed");
    throw error;
  }

  return response.json();
}
