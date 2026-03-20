import { useEffect, useState, useRef } from "react";
import { api } from "../api/api";

export default function Configuracion() {
  const [form, setForm] = useState({
    prof_nombre: "", prof_matricula: "", prof_especialidad: "Nutricionista"
  });
  const [firma, setFirma]     = useState(null);
  const [msg, setMsg]         = useState(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  useEffect(() => {
    api.get("/configuracion").then(data => {
      setForm({
        prof_nombre:       data.prof_nombre       || "",
        prof_matricula:    data.prof_matricula     || "",
        prof_especialidad: data.prof_especialidad  || "Nutricionista",
      });
      setFirma(data.prof_firma || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFirma = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFirma(ev.target.result);
    reader.readAsDataURL(file);
  };

  const guardar = async () => {
    try {
      await api.put("/configuracion", {
        ...form,
        ...(firma !== null ? { prof_firma: firma } : {})
      });
      setMsg({ tipo: "success", texto: "Configuración guardada" });
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ tipo: "danger", texto: "Error: " + e.message });
    }
  };

  const borrarFirma = async () => {
    setFirma("");
    await api.put("/configuracion", { prof_firma: "" });
  };

  const resetDatos = async () => {
    const c1 = window.confirm("¿Borrar todos los pacientes y datos clínicos? La configuración profesional se mantiene.");
    if (!c1) return;
    const c2 = window.confirm("Esta acción no se puede deshacer. ¿Confirmar?");
    if (!c2) return;
    try {
      await api.post("/admin/reset", {});
      setMsg({ tipo: "success", texto: "Datos reseteados correctamente" });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ tipo: "danger", texto: "Error al resetear" });
    }
  };

  if (loading) return <div className="container"><div className="empty-state"><p>Cargando...</p></div></div>;

  return (
    <div className="container">
      <div className="page-title" style={{ marginBottom: 6 }}>Configuración</div>
      <div className="page-subtitle" style={{ marginBottom: 28 }}>Datos del profesional — aparecen como firma en el PDF del plan</div>

      {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 20 }}>{msg.texto}</div>}

      <div className="card" style={{ maxWidth: 580 }}>
        <div className="card-title">Datos del profesional</div>
        <div className="form-group">
          <label>Nombre y apellido</label>
          <input value={form.prof_nombre} onChange={e => set("prof_nombre", e.target.value)} placeholder="ej: Lic. María González" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Matrícula</label>
            <input value={form.prof_matricula} onChange={e => set("prof_matricula", e.target.value)} placeholder="ej: 12345" />
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <input value={form.prof_especialidad} onChange={e => set("prof_especialidad", e.target.value)} placeholder="ej: Nutricionista" />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 4 }}>
          <label>Firma (imagen PNG o JPG)</label>
          <div style={{ border: "1.5px dashed var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--surface-2)", marginTop: 4 }}>
            {firma ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img src={firma} alt="Firma" style={{ maxHeight: 80, maxWidth: 240, objectFit: "contain", background: "white", padding: 4, borderRadius: 6, border: "1px solid var(--border-light)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 12px" }} onClick={() => fileRef.current.click()}>Cambiar imagen</button>
                  <button className="btn-danger" style={{ fontSize: "0.8rem", padding: "6px 12px" }} onClick={borrarFirma}>Quitar firma</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8, opacity: 0.3 }}>✍️</div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12 }}>Subí una imagen de tu firma (PNG con fondo transparente recomendado)</p>
                <button className="btn-secondary" style={{ fontSize: "0.85rem" }} onClick={() => fileRef.current.click()}>Seleccionar imagen</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" style={{ display: "none" }} onChange={handleFirma} />
          </div>
        </div>
        {(form.prof_nombre || firma) && (
          <div style={{ marginTop: 8, marginBottom: 20, padding: "16px 20px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 12 }}>Preview firma en PDF</div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, textAlign: "center", maxWidth: 220, margin: "0 auto" }}>
              {firma && <img src={firma} alt="firma" style={{ maxHeight: 60, maxWidth: 180, objectFit: "contain", marginBottom: 8, display: "block", margin: "0 auto 8px" }} />}
              {form.prof_nombre && <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{form.prof_nombre}</div>}
              {form.prof_matricula && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Mat. {form.prof_matricula}</div>}
              {form.prof_especialidad && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{form.prof_especialidad}</div>}
            </div>
          </div>
        )}
        <button className="btn-primary" onClick={guardar}>Guardar configuración</button>
      </div>

      {/* Zona de peligro */}
      <div className="card" style={{ maxWidth: 580, marginTop: 24, border: "1px solid #fcd0cc" }}>
        <div className="card-title" style={{ color: "#b5341a" }}>Zona de peligro</div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 16 }}>
          Borra todos los pacientes, visitas, laboratorios, planes y composición corporal. La configuración del profesional se mantiene.
        </p>
        <button
          style={{ background: "#fdecea", color: "#b5341a", border: "1px solid #f5c6bf", borderRadius: "var(--radius)", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
          onClick={resetDatos}
        >
          🗑️ Resetear todos los datos
        </button>
      </div>
    </div>
  );
}
