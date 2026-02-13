const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";

  // Si el backend devuelve HTML (error), evitamos explotar con JSON.parse
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  // Pacientes
  listarPacientes: () => request("/pacientes"),
  buscarPacientes: (q) => request(`/pacientes/buscar?q=${encodeURIComponent(q)}`),
  crearPaciente: (payload) =>
    request("/pacientes", { method: "POST", body: JSON.stringify(payload) }),
  obtenerPaciente: (id) => request(`/pacientes/${id}`),
  actualizarPaciente: (id, payload) =>
    request(`/pacientes/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  // Visitas
  crearVisita: (pacienteId, payload) =>
    request(`/pacientes/${pacienteId}/visitas`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listarVisitas: (pacienteId) => request(`/pacientes/${pacienteId}/visitas`),

  // Alimentos (global)
  listarAlimentos: () => request("/alimentos"),
  crearAlimento: (payload) =>
    request("/alimentos", { method: "POST", body: JSON.stringify(payload) }),
  actualizarAlimento: (id, payload) =>
    request(`/alimentos/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  eliminarAlimento: (id) =>
    request(`/alimentos/${id}`, { method: "DELETE" }),

  // Plan (1 activo)
  crearPlan: (pacienteId, payload) =>
    request(`/pacientes/${pacienteId}/plan`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verPlanActual: (pacienteId) => request(`/pacientes/${pacienteId}/plan`),
  agregarAlimentoPlan: (planId, payload) =>
    request(`/planes/${planId}/alimentos`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  // PDF Plan
  planPdfUrl: (pacienteId) => `${API_URL}/pacientes/${pacienteId}/plan/pdf`,
};
