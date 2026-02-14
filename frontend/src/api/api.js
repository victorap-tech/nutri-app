const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || ""; // si está vacío, usa mismo dominio

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let body = null;
  if (isJson) {
    body = await res.json().catch(() => null);
  } else {
    // si llega HTML por error, no rompemos
    const text = await res.text().catch(() => "");
    body = { error: "non_json_response", raw: text?.slice(0, 200) };
  }

  if (!res.ok) {
    const msg = body?.error || `HTTP_${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
