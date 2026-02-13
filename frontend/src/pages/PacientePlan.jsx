import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import TabsPaciente from "../components/TabsPaciente";

const COMIDAS = ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena"];

export default function PacientePlan() {
  const { id } = useParams();
  const nav = useNavigate();

  const [err, setErr] = useState("");
  const [alimentos, setAlimentos] = useState([]);
  const [plan, setPlan] = useState(null);

  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [comida, setComida] = useState("Desayuno");
  const [cantidad, setCantidad] = useState("");

  async function cargar() {
    setErr("");
    try {
      const [a, p] = await Promise.all([
        api.listarAlimentos(),
        api.verPlanActual(id).catch(() => null),
      ]);
      setAlimentos(a);
      setPlan(p);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => { cargar(); }, [id]);

  const categorias = useMemo(() => {
    const set = new Set(alimentos.map((a) => a.categoria).filter(Boolean));
    return Array.from(set).sort();
  }, [alimentos]);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return alimentos.filter((a) => {
      if (categoria && a.categoria !== categoria) return false;
      if (!t) return true;
      return `${a.nombre} ${a.categoria}`.toLowerCase().includes(t);
    });
  }, [alimentos, q, categoria]);

  const porComida = useMemo(() => {
    const m = {};
    COMIDAS.forEach((c) => (m[c] = []));
    if (plan?.alimentos) {
      for (const it of plan.alimentos) {
        const c = it.comida || "Otros";
        if (!m[c]) m[c] = [];
        m[c].push(it);
      }
    }
    return m;
  }, [plan]);

  async function asegurarPlan() {
    // 1 plan activo: si no hay, lo crea
    if (plan?.plan_id) return plan.plan_id;

    const r = await api.crearPlan(id, { fecha: new Date().toISOString().slice(0, 10) });
    const nuevo = await api.verPlanActual(id);
    setPlan(nuevo);
    return r.plan_id;
  }

  async function agregar(alimentoId) {
    setErr("");
    try {
      const planId = await asegurarPlan();
      await api.agregarAlimentoPlan(planId, {
        alimento_id: alimentoId,
        comida,
        cantidad: cantidad || null, // el backend debe soportar esto (te lo dejo abajo)
      });
      setCantidad("");
      await cargar();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  return (
    <div className="container">
      <div className="row-between">
        <h1>Plan Alimentario (1 activo)</h1>
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
      </div>

      <TabsPaciente />

      {err && <div className="alert error">{err}</div>}

      <div className="row-between">
        <div className="row gap">
          <select value={comida} onChange={(e) => setComida(e.target.value)}>
            {COMIDAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <input
            style={{ maxWidth: 220 }}
            placeholder="Cantidad (ej: 150g, 1 taza)"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>

        <a className="btn primary" href={api.planPdfUrl(id)} target="_blank" rel="noreferrer">
          Exportar PDF
        </a>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Armar plan (desde catálogo global)</h3>

          <div className="searchbar">
            <input placeholder="Buscar alimento..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="list">
            {filtrados.slice(0, 50).map((a) => (
              <div key={a.id} className="list-item row-between">
                <div>
                  <div className="list-title">{a.nombre}</div>
                  <div className="list-sub">{a.categoria || "—"}</div>
                </div>
                <button className="btn primary" onClick={() => agregar(a.id)}>Agregar</button>
              </div>
            ))}
            {filtrados.length === 0 && <div className="muted">No hay alimentos.</div>}
          </div>
        </div>

        <div className="card">
          <h3>Plan actual</h3>

          {!plan ? (
            <div className="muted">Sin plan activo. Agregá un alimento y se crea automáticamente.</div>
          ) : (
            <div className="plan">
              {Object.entries(porComida).map(([c, items]) => (
                <div key={c} className="plan-block">
                  <div className="plan-title">{c}</div>
                  {items.length === 0 ? (
                    <div className="muted">—</div>
                  ) : (
                    <ul>
                      {items.map((it, idx) => (
                        <li key={`${it.nombre}-${idx}`}>
                          {it.nombre} <span className="muted">{it.cantidad ? `· ${it.cantidad}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="alert info">
        Nota: para “editar/eliminar items del plan” te dejo abajo el endpoint mínimo a agregar (DELETE /plan_items/:id).
      </div>
    </div>
  );
}
