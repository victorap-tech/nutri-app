import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Configuracion() {
  const [form, setForm] = useState({
    prof_nombre: "", prof_matricula: "", prof_especialidad: "Nutricionista"
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/configuracion")
      .then(data => { setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guardar = async () => {
    try {
      await api.put("/configuracion", form);
      setMsg({ tipo: "success", texto: "Configuración guardada" });
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ tipo: "danger", texto: "Error: " + e.message });
    }
  };

  if (loading) return <div className="container"><div className="empty-state"><p>Cargando...</p></div></div>;

  return (
    <div className="container">
      <div className="page-title" style={{ marginBottom: 6 }}>Configuración</div>
      <div className="page-subtitle" style={{ marginBottom: 28 }}>Datos del profesional — aparecen como firma en el PDF del plan</div>

      {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 20 }}>{msg.texto}</div>}

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-title">Datos del profesional</div>

        <div className="form-group">
          <label>Nombre y apellido</label>
          <input
            value={form.prof_nombre}
            onChange={e => set("prof_nombre", e.target.value)}
            placeholder="ej: Lic. María González"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Matrícula</label>
            <input
              value={form.prof_matricula}
              onChange={e => set("prof_matricula", e.target.value)}
              placeholder="ej: 12345"
            />
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <input
              value={form.prof_especialidad}
              onChange={e => set("prof_especialidad", e.target.value)}
              placeholder="ej: Nutricionista"
            />
          </div>
        </div>

        {/* Preview firma */}
        {form.prof_nombre && (
          <div style={{
            marginTop: 8,
            marginBottom: 20,
            padding: "16px 20px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-light)",
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>
              Preview firma en PDF
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, textAlign: "center", maxWidth: 200, margin: "0 auto" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{form.prof_nombre}</div>
              {form.prof_matricula && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Mat. {form.prof_matricula}</div>}
              {form.prof_especialidad && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{form.prof_especialidad}</div>}
            </div>
          </div>
        )}

        <button className="btn-primary" onClick={guardar}>
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
