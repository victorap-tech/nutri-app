import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api";

const CAMPOS = [
  { key: "glucosa",         label: "Glucosa",        unit: "mg/dL", ref: "70–100" },
  { key: "colesterol_total",label: "Col. Total",      unit: "mg/dL", ref: "<200"   },
  { key: "hdl",             label: "HDL",             unit: "mg/dL", ref: ">40"    },
  { key: "ldl",             label: "LDL",             unit: "mg/dL", ref: "<100"   },
  { key: "trigliceridos",   label: "Triglicéridos",   unit: "mg/dL", ref: "<150"   },
  { key: "tsh",             label: "TSH",             unit: "µUI/mL",ref: "0.4–4"  },
];

const FORM_VACIO = {
  fecha: new Date().toISOString().slice(0, 10),
  glucosa: "", colesterol_total: "", hdl: "",
  ldl: "", trigliceridos: "", tsh: "", observaciones: "",
};

export default function PacienteLaboratorio() {
  const { id } = useParams();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);

  const flash = (tipo, texto) => {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 3000);
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/pacientes/${id}/laboratorio`);
      setLabs(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guardar = async () => {
    setError("");
    try {
      await api.post(`/pacientes/${id}/laboratorio`, form);
      setForm(FORM_VACIO);
      await cargar();
      flash("success", "Registro guardado");
    } catch (e) {
      setError(e.message);
    }
  };

  const eliminar = async (labId) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await api.delete(`/laboratorio/${labId}`);
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const ultimo = labs[0];

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
      {msg   && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      {/* ── Último análisis en cards ── */}
      {ultimo && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>
            Último análisis — {new Date(ultimo.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
          <div className="lab-grid">
            {CAMPOS.map(({ key, label, unit, ref }) => (
              <div key={key} className="lab-item">
                <div className="lab-item-label">{label}</div>
                <div className="lab-item-value">
                  {ultimo[key] ?? <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>—</span>}
                  {ultimo[key] && <span className="lab-item-unit"> {unit}</span>}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-light)", marginTop: 2 }}>Ref: {ref}</div>
              </div>
            ))}
          </div>
          {ultimo.observaciones && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {ultimo.observaciones}
            </div>
          )}
        </div>
      )}

      {/* ── Formulario nuevo registro ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Nuevo registro de laboratorio</div>

        <div className="form-group">
          <label>Fecha</label>
          <input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} style={{ maxWidth: 200 }} />
        </div>

        <div className="form-row">
          {CAMPOS.map(({ key, label, unit }) => (
            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
              <label>{label} <span style={{ fontWeight: 400, textTransform: "none" }}>({unit})</span></label>
              <input
                type="number"
                step="0.01"
                placeholder="—"
                value={form[key]}
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Observaciones</label>
          <textarea rows={2} value={form.observaciones} onChange={e => set("observaciones", e.target.value)} />
        </div>

        <button className="btn-primary" onClick={guardar} style={{ marginTop: 4 }}>
          Guardar registro
        </button>
      </div>

      {/* ── Historial ── */}
      <div className="card">
        <div className="card-title">Historial de análisis</div>

        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : labs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧪</div>
            <p>No hay registros de laboratorio aún.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  {CAMPOS.map(c => <th key={c.key}>{c.label}</th>)}
                  <th>Obs.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {labs.map(l => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                      {new Date(l.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    {CAMPOS.map(c => (
                      <td key={c.key} style={{ fontSize: "0.85rem" }}>{l[c.key] ?? "—"}</td>
                    ))}
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: 160 }}>{l.observaciones || "—"}</td>
                    <td>
                      <button className="btn-icon" onClick={() => eliminar(l.id)} title="Eliminar">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
