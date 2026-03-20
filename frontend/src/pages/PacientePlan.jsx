import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api";

const COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function PacientePlan() {
  const { id } = useParams();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [plan, setPlan] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [nuevoItem, setNuevoItem] = useState({ alimento_id: "", comida: "Desayuno", cantidad: "", dia: "Lunes" });
  const [vista, setVista] = useState("semanal"); // "semanal" | "porcomida"

  const flash = (tipo, texto) => { setMsg({ tipo, texto }); setTimeout(() => setMsg(null), 3000); };

  const cargarPlan = async () => {
    try { setPlan(await api.get(`/pacientes/${id}/plan`)); }
    catch { setPlan(null); }
  };

  const cargarAlimentos = async () => {
    try { setAlimentos(await api.get("/alimentos")); }
    catch (e) { setError(e.message); }
  };

  useEffect(() => { cargarPlan(); cargarAlimentos(); }, [id]);

  const crearPlan = async () => {
    setError("");
    try {
      await api.post(`/pacientes/${id}/plan`, { fecha });
      await cargarPlan();
      flash("success", "Plan creado correctamente");
    } catch (e) { setError(e.message); }
  };

  const agregarAlimento = async () => {
    if (!plan || !nuevoItem.alimento_id) return;
    try {
      await api.post(`/planes/${plan.plan_id}/alimentos`, nuevoItem);
      setNuevoItem({ alimento_id: "", comida: "Desayuno", cantidad: "", dia: nuevoItem.dia });
      await cargarPlan();
    } catch (e) { setError(e.message); }
  };

  const eliminarItem = async (itemId) => {
    try { await api.delete(`/plan_item/${itemId}`); await cargarPlan(); }
    catch (e) { setError(e.message); }
  };

  // Agrupar por día y comida
  const getItems = (dia, comida) =>
    plan?.alimentos?.filter(a => (a.dia || "Lunes") === dia && a.comida === comida) || [];

  // Agrupar por comida (vista alternativa)
  const porComida = COMIDAS.reduce((acc, c) => {
    const items = plan?.alimentos?.filter(a => a.comida === c) || [];
    if (items.length) acc[c] = items;
    return acc;
  }, {});

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
      {msg   && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      {/* Crear plan */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Nuevo plan alimentario</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Fecha del plan</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={crearPlan}>Crear plan</button>
        </div>
      </div>

      {/* Plan actual */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.1rem" }}>Plan actual</div>
            {plan && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
              {new Date(plan.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
            </div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {plan && (
              <>
                <div style={{ display: "flex", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                  {["semanal", "porcomida"].map(v => (
                    <button key={v} onClick={() => setVista(v)} style={{
                      padding: "5px 12px", fontSize: "0.78rem", border: "none",
                      background: vista === v ? "var(--accent)" : "var(--surface)",
                      color: vista === v ? "white" : "var(--text)", cursor: "pointer",
                    }}>{v === "semanal" ? "Semanal" : "Por comida"}</button>
                  ))}
                </div>
                <a href={`${import.meta.env.VITE_API_URL}/pacientes/${id}/plan/pdf`} target="_blank" rel="noreferrer">
                  <button className="btn-secondary">📄 PDF</button>
                </a>
              </>
            )}
          </div>
        </div>

        {!plan ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><p>No hay plan activo. Creá uno arriba.</p></div>
        ) : (
          <>
            {/* Agregar alimento */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)", borderRadius: "var(--radius)", padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 12 }}>Agregar alimento</div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Alimento</label>
                  <select value={nuevoItem.alimento_id} onChange={e => setNuevoItem({ ...nuevoItem, alimento_id: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {alimentos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Día</label>
                  <select value={nuevoItem.dia} onChange={e => setNuevoItem({ ...nuevoItem, dia: e.target.value })}>
                    {DIAS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Momento</label>
                  <select value={nuevoItem.comida} onChange={e => setNuevoItem({ ...nuevoItem, comida: e.target.value })}>
                    {COMIDAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Cantidad</label>
                  <input placeholder="ej: 1 taza, 200g" value={nuevoItem.cantidad} onChange={e => setNuevoItem({ ...nuevoItem, cantidad: e.target.value })} />
                </div>
              </div>
              <button className="btn-primary" onClick={agregarAlimento} disabled={!nuevoItem.alimento_id}>+ Agregar</button>
            </div>

            {/* Vista semanal */}
            {vista === "semanal" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: 700, borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 90, background: "var(--surface-2)", padding: "8px 10px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", textAlign: "left", borderBottom: "2px solid var(--border)" }}>Comida</th>
                      {DIAS.map(dia => (
                        <th key={dia} style={{ background: "var(--surface-2)", padding: "8px 6px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", textAlign: "center", borderBottom: "2px solid var(--border)", minWidth: 100 }}>{dia}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMIDAS.map((comida, ci) => (
                      <tr key={comida} style={{ background: ci % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}>
                        <td style={{ padding: "10px 10px", fontWeight: 600, fontSize: "0.8rem", color: "var(--accent)", borderBottom: "1px solid var(--border-light)", verticalAlign: "top" }}>{comida}</td>
                        {DIAS.map(dia => {
                          const items = getItems(dia, comida);
                          return (
                            <td key={dia} style={{ padding: "8px 6px", borderBottom: "1px solid var(--border-light)", verticalAlign: "top", minHeight: 40 }}>
                              {items.map(item => (
                                <div key={item.item_id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4, marginBottom: 4, background: "var(--surface)", borderRadius: 6, padding: "4px 6px", border: "1px solid var(--border-light)" }}>
                                  <div>
                                    <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text)" }}>{item.nombre}</div>
                                    {item.cantidad && <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{item.cantidad}</div>}
                                  </div>
                                  <button onClick={() => eliminarItem(item.item_id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.7rem", color: "var(--text-muted)", padding: "0 2px", lineHeight: 1 }} title="Eliminar">✕</button>
                                </div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Vista por comida */}
            {vista === "porcomida" && (
              Object.keys(porComida).length === 0 ? (
                <div className="empty-state"><p>Agregá alimentos al plan.</p></div>
              ) : (
                Object.entries(porComida).map(([comida, items]) => (
                  <div key={comida} style={{ marginBottom: 20 }}>
                    <div className="plan-section-title">{comida}</div>
                    <div style={{ marginTop: 8 }}>
                      {items.map(item => (
                        <div key={item.item_id} className="plan-food">
                          <div>
                            <div className="plan-food-name">{item.nombre}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.dia} · {item.categoria}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span className="plan-food-qty">{item.cantidad || "—"}</span>
                            <button className="btn-icon" onClick={() => eliminarItem(item.item_id)} title="Eliminar">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
