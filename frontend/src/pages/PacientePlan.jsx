import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";
import { apiFetch } from "../api";

const COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];

export default function PacientePlan() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  // crear plan
  const [fechaPlan, setFechaPlan] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // alimentos
  const [alimentos, setAlimentos] = useState([]);
  const [alimentoId, setAlimentoId] = useState("");
  const [comida, setComida] = useState("Almuerzo");
  const [cantidad, setCantidad] = useState("");

  const apiBase = useMemo(() => process.env.REACT_APP_API_URL || "", []);

  async function cargarTodo() {
    setLoading(true);
    setError("");

    try {
      // 1) intentar traer plan actual
      const planData = await apiFetch(`/pacientes/${id}/plan`);
      setPlan(planData);
    } catch (e) {
      // si no hay plan, lo dejamos null (no error)
      if (e.status === 404) {
        setPlan(null);
      } else {
        setError(`Error cargando plan: ${e.message}`);
        setPlan(null);
      }
    }

    try {
      const alimentosData = await apiFetch(`/alimentos`);
      setAlimentos(alimentosData);
    } catch (e) {
      setError((prev) => prev || `Error cargando alimentos: ${e.message}`);
    }

    setLoading(false);
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line
  }, [id]);

  async function handleCrearPlan() {
    setError("");
    try {
      if (!fechaPlan) throw new Error("Fecha inválida");
      const data = await apiFetch(`/pacientes/${id}/plan`, {
        method: "POST",
        body: JSON.stringify({ fecha: fechaPlan }),
      });

      // recargar plan actual
      const planData = await apiFetch(`/pacientes/${id}/plan`);
      setPlan(planData);
    } catch (e) {
      setError(`No se pudo crear el plan: ${e.message}`);
    }
  }

  async function handleAgregarAlimento() {
    setError("");
    try {
      if (!plan?.plan_id) throw new Error("No hay plan activo");
      if (!alimentoId) throw new Error("Elegí un alimento");
      if (!comida) throw new Error("Elegí comida");

      await apiFetch(`/planes/${plan.plan_id}/alimentos`, {
        method: "POST",
        body: JSON.stringify({
          alimento_id: Number(alimentoId),
          comida,
          cantidad: cantidad?.trim() || null,
        }),
      });

      const planData = await apiFetch(`/pacientes/${id}/plan`);
      setPlan(planData);
      setCantidad("");
    } catch (e) {
      setError(`No se pudo agregar: ${e.message}`);
    }
  }

  async function handleEliminarItem(itemId) {
    setError("");
    try {
      await apiFetch(`/plan_item/${itemId}`, { method: "DELETE" });
      const planData = await apiFetch(`/pacientes/${id}/plan`);
      setPlan(planData);
    } catch (e) {
      setError(`No se pudo eliminar: ${e.message}`);
    }
  }

  function pdfUrl() {
    const base = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
    return `${base}/pacientes/${id}/plan/pdf`;
  }

  if (loading) {
    return (
      <div className="page">
        <TabsPaciente />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <TabsPaciente />

      <h2>Plan Alimentario</h2>

      {error ? <div className="alert-error">{error}</div> : null}

      {!plan ? (
        <div className="card">
          <h3>Crear nuevo plan</h3>
          <div className="row">
            <label>Fecha</label>
            <input
              type="date"
              value={fechaPlan}
              onChange={(e) => setFechaPlan(e.target.value)}
            />
            <button onClick={handleCrearPlan}>Crear plan</button>
          </div>
          <p className="muted">
            No hay plan activo. Creá uno para poder cargar alimentos y descargar PDF.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="row space">
              <div>
                <h3>Plan activo</h3>
                <p className="muted">Fecha: {plan.fecha}</p>
              </div>

              <a className="btn" href={pdfUrl()} target="_blank" rel="noreferrer">
                Descargar PDF
              </a>
            </div>
          </div>

          <div className="card">
            <h3>Agregar alimentos al plan</h3>

            <div className="grid">
              <div>
                <label>Comida</label>
                <select value={comida} onChange={(e) => setComida(e.target.value)}>
                  {COMIDAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Alimento</label>
                <select value={alimentoId} onChange={(e) => setAlimentoId(e.target.value)}>
                  <option value="">-- Seleccionar --</option>
                  {alimentos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Cantidad (opcional)</label>
                <input
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej: 1 taza / 200g / 2 unidades"
                />
              </div>

              <div className="actions">
                <button onClick={handleAgregarAlimento}>Agregar</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Alimentos del plan</h3>

            {(!plan.alimentos || plan.alimentos.length === 0) ? (
              <p className="muted">Todavía no hay alimentos cargados en este plan.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Comida</th>
                    <th>Alimento</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {plan.alimentos.map((it) => (
                    <tr key={it.item_id}>
                      <td>{it.comida}</td>
                      <td>{it.nombre}</td>
                      <td>{it.categoria}</td>
                      <td>{it.cantidad || "-"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn-danger" onClick={() => handleEliminarItem(it.item_id)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
