const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  // Asegura que la URL no tenga doble barra si el path ya trae una
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const text = await res.text();
    console.error("Error en la API:", text);
    throw new Error(text);
  }

  // Si la respuesta es JSON, la parsea automáticamente
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

// Objeto con los métodos HTTP que tu componente PacienteEvolucion está llamando
export const api = {
  get: (path) => request(path),
  
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
    
  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
    
  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};
