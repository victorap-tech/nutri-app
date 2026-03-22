import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];
const DIAS    = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function PlanPublico() {
  const [dni, setDni]     = useState("");
  const [plan, setPlan]   = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!dni.trim()) return;
    setLoading(true); setError(""); setPlan(null);
    try {
      const res = await fetch(`${API}/publico/plan/${dni.trim()}`);
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "paciente_no_encontrado") setError("No se encontró ningún paciente con ese DNI.");
        else if (data.error === "sin_plan") setError("Tu nutricionista aún no cargó tu plan alimentario.");
        else setError("Error al cargar el plan.");
        return;
      }
      setPlan(await res.json());
    } catch { setError("Error de conexión. Intentá de nuevo."); }
    finally { setLoading(false); }
  };

  const getItems = (dia, comida) =>
    plan?.alimentos?.filter(a => (a.dia || "Lunes") === dia && a.comida === comida) || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 16px", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "2rem", fontWeight: 300, color: "var(--text)" }}>
            Mi Plan Alimentario
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 8 }}>
            Ingresá tu DNI para ver tu plan
          </div>
        </div>

        {/* Buscador */}
        {!plan && (
          <div className="card" style={{ maxWidth: 400, margin: "0 auto 32px" }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Número de DNI</label>
              <input
                type="number"
                value={dni}
                onChange={e => setDni(e.target.value)}
                placeholder="ej: 12345678"
                onKeyDown={e => e.key === "Enter" && buscar()}
                style={{ fontSize: "1.1rem", textAlign: "center", letterSpacing: "0.05em" }}
              />
            </div>
            {error && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{error}</div>}
            <button className="btn-primary" onClick={buscar} disabled={loading} style={{ width: "100%" }}>
              {loading ? "Buscando..." : "Ver mi plan"}
            </button>
          </div>
        )}

        {/* Plan */}
        {plan && (
          <>
            {/* Encabezado paciente */}
            <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.3rem", fontWeight: 400 }}>
                  {plan.paciente.nombre} {plan.paciente.apellido}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                  Plan del {new Date(plan.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => { setPlan(null); setDni(""); }}>
                Salir
              </button>
            </div>

            {/* Grilla semanal */}
            <div className="card" style={{ overflowX: "auto" }}>
              <table style={{ minWidth: 600, borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: 90, background: "var(--surface-2)", padding: "8px 10px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                      Comida
                    </th>
                    {DIAS.map(dia => (
                      <th key={dia} style={{ background: "var(--surface-2)", padding: "8px 6px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", textAlign: "center", borderBottom: "2px solid var(--border)", minWidth: 90 }}>
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMIDAS.map((comida, ci) => (
                    <tr key={comida} style={{ background: ci % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}>
                      <td style={{ padding: "10px", fontWeight: 600, fontSize: "0.8rem", color: "var(--accent)", borderBottom: "1px solid var(--border-light)", verticalAlign: "top" }}>
                        {comida}
                      </td>
                      {DIAS.map(dia => {
                        const items = getItems(dia, comida);
                        return (
                          <td key={dia} style={{ padding: "8px 6px", borderBottom: "1px solid var(--border-light)", verticalAlign: "top" }}>
                            {items.map((item, idx) => (
                              <div key={idx} style={{ marginBottom: 4, padding: "4px 6px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border-light)" }}>
                                <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text)" }}>{item.nombre}</div>
                                {item.cantidad && <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{item.cantidad}</div>}
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
          </>
        )}
      </div>
    </div>
  );
}
