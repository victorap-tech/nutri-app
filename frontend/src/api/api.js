const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Pacientes
  pacientes: () => req("/pacientes"),
  crearPaciente: (payload) => req("/pacientes", { method: "POST", body: JSON.stringify(payload) }),

  // Alimentos
  alimentos: () => req("/alimentos"),
  crearAlimento: (payload) => req("/alimentos", { method: "POST", body: JSON.stringify(payload) }),

  // Plan
  crearPlan: (pacienteId, payload) => req(`/pacientes/${pacienteId}/plan`, { method: "POST", body: JSON.stringify(payload) }),
  verPlanActual: (pacienteId) => req(`/pacientes/${pacienteId}/plan`),
  agregarAlimentoPlan: (planId, payload) => req(`/planes/${planId}/alimentos`, { method: "POST", body: JSON.stringify(payload) }),
  copiarPlan: (pacienteId, payload) => req(`/pacientes/${pacienteId}/plan/copiar`, { method: "POST", body: JSON.stringify(payload) }),

  // PDF
  planPdfUrl: (pacienteId) => `${BASE}/pacientes/${pacienteId}/plan/pdf`
};
