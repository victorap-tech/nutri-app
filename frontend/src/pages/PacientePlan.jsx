import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api";

const COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];

export default function PacientePlan() {
  const { id } = useParams();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [plan, setPlan] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);
  const [nuevoItem, setNuevoItem] = useState({ alimento_id: "", comida: "Desayuno", cantidad: "" });

  const flash = (tipo, texto) => {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 3000);
  };

  const cargarPlan = async () => {
    try {
      const data = await api.get(`/pacientes/${id}/plan`);
      setPlan(data);
    } catch {
      setPlan(null);
    }
  };

  const cargarAlimentos = async () => {
    try {
      const data = await api.get("/alimentos");
      setAlimentos(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    cargarPlan();
    cargarAlimentos();
  }, [id]);

  const crearPlan = async () => {
    setError("");
    try {
      await api.post(`/pacientes/${id}/plan`, { fecha });
      await cargarPlan();
      flash("success", "Plan creado correctamente");
    } catch (e) {
      setError(e.message);
    }
  };

  const agregarAlimento = async () => {
    if (!plan || !nuevoItem.alimento_id) return;
    try {
      await api.post(`/planes/${plan.plan_id}/alimentos`, nuevoItem);
      setNuevoItem({ alimento_id: "", comida: "Desayuno", cantidad: "" });
      await cargarPlan();
    } catch (e) {
      setError(e.message);
    }
  };

  const eliminarItem = async (itemId) => {
    try {
      await api.delete(`/plan_item/${itemId}`);
      await cargarPlan();
    } catch (e) {
      setError(e.message);
    }
  };

  // Agrupar alimentos por comida
  const porComida = COMIDAS.reduce((acc, c) => {
    const items = plan?.alimentos?.filter(a => a.comida === c) || [];
    if (items.length) acc[c] = items;
    return acc;
  }, {});

  return (
    <div>
      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
      {msg   && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      {/* ── Crear plan ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Nuevo plan alimentario</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Fecha del plan</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={crearPlan} style={{ marginBottom: 0 }}>
            Crear plan
          </button>
        </div>
      </div>

      {/* ── Plan actual ── */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.1rem", fontWeight: 400 }}>
              Plan actual
            </div>
            {plan && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                {new Date(plan.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            )}
          </div>
          {plan && (
            <a
              href={`${import.meta.env.VITE_API_URL}/pacientes/${id}/plan/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <button className="btn-secondary">
                📄 Descargar PDF
              </button>
            </a>
          )}
        </div>

        {!plan ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No hay plan activo. Creá uno arriba.</p>
          </div>
        ) : (
          <>
            {/* Agregar alimento */}
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius)",
              padding: "16px",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 12 }}>
                Agregar alimento
              </div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Alimento</label>
                  <select
                    value={nuevoItem.alimento_id}
                    onChange={e => setNuevoItem({ ...nuevoItem, alimento_id: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {alimentos.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Momento</label>
                  <select
                    value={nuevoItem.comida}
                    onChange={e => setNuevoItem({ ...nuevoItem, comida: e.target.value })}
                  >
                    {COMIDAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Cantidad</label>
                  <input
                    placeholder="ej: 1 taza, 200g"
                    value={nuevoItem.cantidad}
                    onChange={e => setNuevoItem({ ...nuevoItem, cantidad: e.target.value })}
                  />
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={agregarAlimento}
                disabled={!nuevoItem.alimento_id}
              >
                + Agregar
              </button>
            </div>

            {/* Lista agrupada por comida */}
            {Object.keys(porComida).length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <p>Agregá alimentos al plan.</p>
              </div>
            ) : (
              Object.entries(porComida).map(([comida, items]) => (
                <div key={comida} style={{ marginBottom: 20 }}>
                  <div className="plan-section-title">{comida}</div>
                  <div style={{ marginTop: 8 }}>
                    {items.map(item => (
                      <div key={item.item_id} className="plan-food">
                        <div>
                          <div className="plan-food-name">{item.nombre}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.categoria}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span className="plan-food-qty">{item.cantidad || "—"}</span>
                          <button className="btn-icon" onClick={() => eliminarItem(item.item_id)} title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
