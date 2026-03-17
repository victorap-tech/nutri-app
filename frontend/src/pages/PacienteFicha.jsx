import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IMCBar from "../components/IMCBar";
import { api } from "../api/api";

function toNum(v) {
  if (v === "" || v == null) return null;
  return Number(String(v).replace(",", "."));
}

export default function PacienteFicha() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const cargar = () =>
    api.get(`/pacientes/${id}`).then(data => {
      setPaciente(data);
      setForm({
        nombre:      data.nombre      ?? "",
        apellido:    data.apellido    ?? "",
        dni:         data.dni         ?? "",
        edad:        data.edad        ?? "",
        altura:      data.altura      ?? "",
        peso:        data.peso        ?? "",
        cintura:     data.cintura     ?? "",
        diagnostico: data.diagnostico ?? "",
        fecha_visita: data.fecha_visita ?? "",
      });
    });

  useEffect(() => { cargar(); }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guardar = async () => {
    setSaving(true);
    try {
      await api.put(`/pacientes/${id}`, {
        ...form,
        edad:    form.edad    ? Number(form.edad) : null,
        altura:  toNum(form.altura),
        peso:    toNum(form.peso),
        cintura: toNum(form.cintura),
      });
      await cargar();
      setEditando(false);
      setMsg({ tipo: "success", texto: "Datos guardados correctamente" });
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ tipo: "danger", texto: "Error al guardar: " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const cancelar = () => {
    setForm({
      nombre:      paciente.nombre      ?? "",
      apellido:    paciente.apellido    ?? "",
      dni:         paciente.dni         ?? "",
      edad:        paciente.edad        ?? "",
      altura:      paciente.altura      ?? "",
      peso:        paciente.peso        ?? "",
      cintura:     paciente.cintura     ?? "",
      diagnostico: paciente.diagnostico ?? "",
      fecha_visita: paciente.fecha_visita ?? "",
    });
    setEditando(false);
  };

  if (!paciente) return (
    <div className="empty-state">
      <div className="empty-state-icon">⏳</div>
      <p>Cargando ficha...</p>
    </div>
  );

  // ── Vista lectura ──────────────────────────────────────
  if (!editando) return (
    <div>
      {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      {/* Grid de datos */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
        marginBottom: "16px",
      }}>
        {[
          { label: "DNI",     value: paciente.dni },
          { label: "Edad",    value: paciente.edad,    unit: "años" },
          { label: "Peso",    value: paciente.peso,    unit: "kg"   },
          { label: "Altura",  value: paciente.altura,  unit: "m"    },
          { label: "Cintura", value: paciente.cintura, unit: "cm"   },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{
            background: "var(--surface-2)",
            borderRadius: "10px",
            padding: "14px 16px",
            border: "1px solid var(--border-light)",
          }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.4rem", fontWeight: 300, color: "var(--text)", lineHeight: 1.1 }}>
              {value ?? <span style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>—</span>}
              {value != null && unit && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 4 }}>{unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* IMC */}
      <IMCBar imc={paciente.imc} rango={paciente.rango_imc} />

      {/* Diagnóstico */}
      {paciente.diagnostico && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>
            Diagnóstico
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)", margin: 0 }}>
            {paciente.diagnostico}
          </p>
        </div>
      )}

      {/* Botón editar */}
      <div style={{ marginTop: 20 }}>
        <button className="btn-secondary" onClick={() => setEditando(true)}>
          ✏️ Editar datos
        </button>
      </div>
    </div>
  );

  // ── Vista edición ──────────────────────────────────────
  return (
    <div className="card">
      <div className="card-title">Editar datos del paciente</div>

      {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Nombre</label>
          <input value={form.nombre} onChange={e => set("nombre", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Apellido</label>
          <input value={form.apellido} onChange={e => set("apellido", e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>DNI</label>
          <input value={form.dni} onChange={e => set("dni", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Edad</label>
          <input type="number" value={form.edad} onChange={e => set("edad", e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Peso (kg)</label>
          <input type="number" step="0.1" value={form.peso} onChange={e => set("peso", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Altura (m)</label>
          <input type="number" step="0.01" value={form.altura} onChange={e => set("altura", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Cintura (cm)</label>
          <input type="number" step="0.5" value={form.cintura} onChange={e => set("cintura", e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Fecha primera visita</label>
        <input type="date" value={form.fecha_visita} onChange={e => set("fecha_visita", e.target.value)} />
      </div>

      <div className="form-group">
        <label>Diagnóstico</label>
        <textarea rows={3} value={form.diagnostico} onChange={e => set("diagnostico", e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button className="btn-primary" onClick={guardar} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button className="btn-secondary" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
