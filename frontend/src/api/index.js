const API = import.meta.env.VITE_API_URL;

export const api = {
  getPacientes: async () => {
    const res = await fetch(`${API}/pacientes`);
    return res.json();
  },

  getPaciente: async (id) => {
    const res = await fetch(`${API}/pacientes/${id}`);
    return res.json();
  },

  crearPaciente: async (data) => {
    const res = await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  actualizarPaciente: async (id, data) => {
    const res = await fetch(`${API}/pacientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getVisitas: async (id) => {
    const res = await fetch(`${API}/pacientes/${id}/visitas`);
    return res.json();
  },
};
