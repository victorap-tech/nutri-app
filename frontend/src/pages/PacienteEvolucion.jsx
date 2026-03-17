import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function calcularIMC(peso, altura) {
  if (!peso || !altura) return null;
  return Math.round((peso / (altura * altura)) * 100) / 100;
}

function rangoIMC(imc) {
  if (!imc) return "";
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

function imcColor(imc) {
  if (!imc) return "var(--text-muted)";
  if (imc < 18.5) return "#1a6098";
  if (imc < 25) return "#1a6630";
  if (imc < 30) return "#7d5a00";
  return "#c0392b";
}

function Delta({ actual, anterior, unit = "", invertir = false }) {
  if (actual == null || anterior == null) return <span style={{ color: "var(--text-light)" }}>—</span>;
  const diff = Math.round((actual - anterior) * 100) / 100;
  if (diff === 0) return <span style={{ color: "var(--text-muted)" }}>= {actual} {unit}</span>;
  const baja = diff < 0;
  // invertir=true: bajar es bueno (ej. peso en sobrepeso)
  const esBueno = invertir ? baja : !baja;
  return (
    <span style={{ color: esBueno ? "#1a6630" : "#c0392b", fontWeight: 500 }}>
      {baja ? "▼" : "▲"} {Math.abs(diff)} {unit}
    </span>
  );
}

export default function PacienteEvolucion() {
  const { id } = useParams();
  const [visitas, setVisitas] = useState([]);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    peso: "",
    altura: "",
    cintura: "",
    diagnostico: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null);
  const [editId, setEditId] = useState(null);

  const cargar = () => {
    fetch(`${API}/pacientes/${id}/visitas`)
      .then(r => r.json())
      .then(data => setVisitas(data));
  };

  useEffect(() => { cargar(); }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.fecha) return;
    setGuardando(true);
    const url = editId ? `${API}/visitas/${editId}` : `${API}/pacientes/${id}/visitas`;
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    if (res.ok) {
      setMsg({ tipo: "success", texto: editId ? "Visita actualizada" : "Visita registrada" });
      setForm({ fecha: new Date().toISOString().split("T")[0], peso: "", altura: "", cintura: "", diagnostico: "" });
      setEditId(null);
      cargar();
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleEditar = (v) => {
    setEditId(v.id);
    setForm({
      fecha: v.fecha,
      peso: v.peso ?? "",
      altura: v.altura ?? "",
      cintura: v.cintura ?? "",
      diagnostico: v.diagnostico ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (vid) => {
    if (!window.confirm("¿Eliminar esta visita?")) return;
    await fetch(`${API}/visitas/${vid}`, { method: "DELETE" });
    cargar();
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setForm({ fecha: new Date().toISOString().split("T")[0], peso: "", altura: "", cintura: "", diagnostico: "" });
  };

  return (
    <div>
      {/* ── Formulario nueva visita ── */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">
          {editId ? "✏️ Editar visita" : "Registrar nueva visita"}
        </div>

        {msg && (
          <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: "16px" }}>
            {msg.texto}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Peso (kg)</label>
            <input type="number" name="peso" value={form.peso} onChange={handleChange} placeholder="ej: 82.5" step="0.1" />
          </div>
          <div className="form-group">
            <label>Altura (m)</label>
            <input type="number" name="altura" value={form.altura} onChange={handleChange} placeholder="ej: 1.72" step="0.01" />
          </div>
          <div className="form-group">
            <label>Cintura (cm)</label>
            <input type="number" name="cintura" value={form.cintura} onChange={handleChange} placeholder="ej: 88" step="0.5" />
          </div>
        </div>

        <div className="form-group">
          <label>Observaciones</label>
          <textarea name="diagnostico" value={form.diagnostico} onChange={handleChange} placeholder="Notas de la visita..." rows={2} />
        </div>

        {/* Preview IMC en tiempo real */}
        {form.peso && form.altura && (() => {
          const imc = calcularIMC(parseFloat(form.peso), parseFloat(form.altura));
          return imc ? (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "99px",
              background: "var(--surface-2)",
              marginBottom: "16px",
              fontSize: "0.8rem",
              color: imcColor(imc),
              fontWeight: 500,
            }}>
              IMC calculado: <strong>{imc}</strong> — {rangoIMC(imc)}
            </div>
          ) : null;
        })()}

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={guardando}>
            {guardando ? "Guardando..." : editId ? "Actualizar visita" : "+ Registrar visita"}
          </button>
          {editId && (
            <button className="btn-secondary" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* ── Historial comparativo ── */}
      <div className="card">
        <div className="card-title">Historial de evolución</div>

        {visitas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No hay visitas registradas aún.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Δ Peso</th>
                  <th>Altura</th>
                  <th>IMC</th>
                  <th>Cintura</th>
                  <th>Δ Cintura</th>
                  <th>Observaciones</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((v, i) => {
                  const siguiente = visitas[i + 1]; // siguiente = más antigua
                  const imc = calcularIMC(v.peso, v.altura);
                  return (
                    <tr key={v.id}>
                      <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                        {new Date(v.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{v.peso ? `${v.peso} kg` : "—"}</td>
                      <td>
                        {siguiente
                          ? <Delta actual={v.peso} anterior={siguiente.peso} unit="kg" invertir={true} />
                          : <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>inicial</span>
                        }
                      </td>
                      <td>{v.altura ? `${v.altura} m` : "—"}</td>
                      <td>
                        {imc ? (
                          <span style={{
                            fontWeight: 600,
                            color: imcColor(imc),
                            fontSize: "0.85rem",
                          }}>
                            {imc}
                            <span style={{ fontSize: "0.7rem", fontWeight: 400, marginLeft: "4px", color: imcColor(imc) }}>
                              {rangoIMC(imc)}
                            </span>
                          </span>
                        ) : "—"}
                      </td>
                      <td>{v.cintura ? `${v.cintura} cm` : "—"}</td>
                      <td>
                        {siguiente
                          ? <Delta actual={v.cintura} anterior={siguiente.cintura} unit="cm" invertir={true} />
                          : <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>inicial</span>
                        }
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "160px" }}>
                        {v.diagnostico || "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button className="btn-icon" onClick={() => handleEditar(v)} title="Editar">
                            ✏️
                          </button>
                          <button className="btn-icon" onClick={() => handleEliminar(v.id)} title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}    ),
  },
  {
    to: (id) => `/pacientes/${id}/laboratorio`,
    label: "Laboratorio",
    end: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0l-3 7m3-7h6m0 0l3 7M9 14H5m10 0h4"/>
      </svg>
    ),
  },
];

export default function TabsPaciente() {
  const { id } = useParams();

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to(id)}
          end={tab.end}
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
