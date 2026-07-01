export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    code?: string;
    data?: T;
  };

  if (!res.ok || json.success === false) {
    throw new ApiError(
      json.error ?? `So'rov xatolik (${res.status})`,
      res.status,
      json.code
    );
  }

  return json.data as T;
}
