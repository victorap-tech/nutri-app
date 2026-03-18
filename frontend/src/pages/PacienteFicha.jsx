import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IMCBar from "../components/IMCBar";
import { api } from "../api/api";

function toNum(v) {
  if (v === "" || v == null) return null;
  return Number(String(v).replace(",", "."));
}

function DatoCard({ label, value, unit }) {
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border-light)" }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.35rem", fontWeight: 300, color: "var(--text)", lineHeight: 1.1 }}>
        {value ?? <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>—</span>}
        {value != null && unit && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function PresionBadge({ s, d }) {
  if (!s || !d) return <span style={{ color: "var(--text-light)" }}>—</span>;
  const alta = s >= 140 || d >= 90;
  const elevada = !alta && (s >= 130 || d >= 80);
  const color = alta ? "#c0392b" : elevada ? "#c47c00" : "#1a6630";
  const bg    = alta ? "#fdecea"  : elevada ? "#fff4e0"  : "#ebfbee";
  const label = alta ? "HTA" : elevada ? "Elevada" : "Normal";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.35rem", fontWeight: 300 }}>{s}/{d}</span>
      <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: bg, color }}>{label}</span>
    </div>
  );
}

function BarraComp({ label, valor, color, max }) {
  const pct = Math.min(((valor ?? 0) / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 3 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{valor != null ? `${valor}%` : "—"}</span>
      </div>
      <div style={{ height: 7, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

const COMP_VACIO = { fecha: new Date().toISOString().split("T")[0], peso: "", grasa: "", agua: "", musculo: "", osea: "", observaciones: "" };

export default function PacienteFicha() {
  const { id } = useParams();
  const [paciente, setPaciente]         = useState(null);
  const [editando, setEditando]         = useState(false);
  const [form, setForm]                 = useState({});
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState(null);
  const [composicion, setComposicion]   = useState([]);
  const [showCompForm, setShowCompForm] = useState(false);
  const [compForm, setCompForm]         = useState(COMP_VACIO);

  const flash = (tipo, texto) => { setMsg({ tipo, texto }); setTimeout(() => setMsg(null), 3000); };

  const cargar = () =>
    api.get(`/pacientes/${id}`).then(data => {
      setPaciente(data);
      setForm({
        nombre: data.nombre ?? "", apellido: data.apellido ?? "",
        dni: data.dni ?? "", edad: data.edad ?? "",
        altura: data.altura ?? "", peso: data.peso ?? "",
        cintura: data.cintura ?? "", diagnostico: data.diagnostico ?? "",
        fecha_visita: data.fecha_visita ?? "",
        presion_sistolica: data.presion_sistolica ?? "",
        presion_diastolica: data.presion_diastolica ?? "",
      });
    });

  const cargarComp = () =>
    api.get(`/pacientes/${id}/composicion`).then(setComposicion).catch(() => {});

  useEffect(() => { cargar(); cargarComp(); }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guardar = async () => {
    setSaving(true);
    try {
      await api.put(`/pacientes/${id}`, {
        ...form,
        edad: form.edad ? Number(form.edad) : null,
        altura: toNum(form.altura), peso: toNum(form.peso),
        cintura: toNum(form.cintura),
        presion_sistolica: form.presion_sistolica ? Number(form.presion_sistolica) : null,
        presion_diastolica: form.presion_diastolica ? Number(form.presion_diastolica) : null,
      });
      await cargar();
      setEditando(false);
      flash("success", "Datos guardados");
    } catch (e) { flash("danger", "Error: " + e.message); }
    finally { setSaving(false); }
  };

  const cancelar = () => { cargar(); setEditando(false); };

  const guardarComp = async () => {
    try {
      await api.post(`/pacientes/${id}/composicion`, compForm);
      setCompForm(COMP_VACIO);
      setShowCompForm(false);
      await cargarComp();
      flash("success", "Composición registrada");
    } catch (e) { flash("danger", "Error: " + e.message); }
  };

  const eliminarComp = async (cid) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    await api.delete(`/composicion/${cid}`);
    await cargarComp();
  };

  if (!paciente) return <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Cargando...</p></div>;

  const ultimaComp = composicion[0];

  // ── Vista edición ──
  if (editando) return (
    <div className="card">
      <div className="card-title">Editar datos del paciente</div>
      {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      <div className="form-row">
        <div className="form-group"><label>Nombre</label><input value={form.nombre} onChange={e => set("nombre", e.target.value)} /></div>
        <div className="form-group"><label>Apellido</label><input value={form.apellido} onChange={e => set("apellido", e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>DNI</label><input value={form.dni} onChange={e => set("dni", e.target.value)} /></div>
        <div className="form-group"><label>Edad</label><input type="number" value={form.edad} onChange={e => set("edad", e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Peso (kg)</label><input type="number" step="0.1" value={form.peso} onChange={e => set("peso", e.target.value)} /></div>
        <div className="form-group"><label>Altura (m)</label><input type="number" step="0.01" value={form.altura} onChange={e => set("altura", e.target.value)} /></div>
        <div className="form-group"><label>Cintura (cm)</label><input type="number" step="0.5" value={form.cintura} onChange={e => set("cintura", e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Presión sistólica (mmHg)</label><input type="number" value={form.presion_sistolica} onChange={e => set("presion_sistolica", e.target.value)} placeholder="ej: 120" /></div>
        <div className="form-group"><label>Presión diastólica (mmHg)</label><input type="number" value={form.presion_diastolica} onChange={e => set("presion_diastolica", e.target.value)} placeholder="ej: 80" /></div>
      </div>
      <div className="form-group"><label>Fecha primera visita</label><input type="date" value={form.fecha_visita} onChange={e => set("fecha_visita", e.target.value)} /></div>
      <div className="form-group"><label>Diagnóstico</label><textarea rows={3} value={form.diagnostico} onChange={e => set("diagnostico", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={guardar} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        <button className="btn-secondary" onClick={cancelar}>Cancelar</button>
      </div>
    </div>
  );

  // ── Vista lectura ──
  return (
    <div>
      {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      {/* Datos básicos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
        <DatoCard label="DNI"     value={paciente.dni} />
        <DatoCard label="Edad"    value={paciente.edad}    unit="años" />
        <DatoCard label="Peso"    value={paciente.peso}    unit="kg" />
        <DatoCard label="Altura"  value={paciente.altura}  unit="m" />
        <DatoCard label="Cintura" value={paciente.cintura} unit="cm" />
        <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Presión arterial</div>
          <PresionBadge s={paciente.presion_sistolica} d={paciente.presion_diastolica} />
          <div style={{ fontSize: "0.65rem", color: "var(--text-light)", marginTop: 3 }}>mmHg</div>
        </div>
      </div>

      {/* IMC */}
      <IMCBar imc={paciente.imc} rango={paciente.rango_imc} />

      {/* Diagnóstico */}
      {paciente.diagnostico && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>Diagnóstico</div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)", margin: 0 }}>{paciente.diagnostico}</p>
        </div>
      )}

      {/* Composición corporal */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
          <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1rem", fontWeight: 400 }}>Composición corporal</div>
          <button className="btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 12px" }} onClick={() => setShowCompForm(v => !v)}>
            {showCompForm ? "Cancelar" : "+ Registrar balanza"}
          </button>
        </div>

        {/* Formulario nueva composición */}
        {showCompForm && (
          <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid var(--border-light)" }}>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Fecha</label>
                <input type="date" value={compForm.fecha} onChange={e => setCompForm(f => ({ ...f, fecha: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Peso (kg)</label>
                <input type="number" step="0.1" value={compForm.peso} onChange={e => setCompForm(f => ({ ...f, peso: e.target.value }))} placeholder="ej: 82.5" />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>% Grasa</label>
                <input type="number" step="0.1" value={compForm.grasa} onChange={e => setCompForm(f => ({ ...f, grasa: e.target.value }))} placeholder="ej: 28.5" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>% Agua</label>
                <input type="number" step="0.1" value={compForm.agua} onChange={e => setCompForm(f => ({ ...f, agua: e.target.value }))} placeholder="ej: 55.0" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>% Músculo</label>
                <input type="number" step="0.1" value={compForm.musculo} onChange={e => setCompForm(f => ({ ...f, musculo: e.target.value }))} placeholder="ej: 38.0" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>% Masa ósea</label>
                <input type="number" step="0.1" value={compForm.osea} onChange={e => setCompForm(f => ({ ...f, osea: e.target.value }))} placeholder="ej: 4.5" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Observaciones</label>
              <textarea rows={2} value={compForm.observaciones} onChange={e => setCompForm(f => ({ ...f, observaciones: e.target.value }))} />
            </div>
            <button className="btn-primary" onClick={guardarComp}>Guardar</button>
          </div>
        )}

        {/* Último registro en barras */}
        {ultimaComp ? (
          <>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 12 }}>
              Último registro: {new Date(ultimaComp.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
              {ultimaComp.peso && <span> · <strong>{ultimaComp.peso} kg</strong></span>}
            </div>
            <BarraComp label="Grasa corporal"  valor={ultimaComp.grasa}   color="#ff6b6b" max={50} />
            <BarraComp label="Agua total"       valor={ultimaComp.agua}    color="#74c0fc" max={80} />
            <BarraComp label="Masa muscular"    valor={ultimaComp.musculo} color="#51cf66" max={60} />
            <BarraComp label="Masa ósea"        valor={ultimaComp.osea}    color="#ffd43b" max={10} />
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No hay registros de composición corporal.
          </div>
        )}
      </div>

      {/* Botón editar */}
      <div style={{ marginTop: 16 }}>
        <button className="btn-secondary" onClick={() => setEditando(true)}>✏️ Editar datos</button>
      </div>
    </div>
  );
}
