import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PacientePlan() {
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [planesHistorial, setPlanesHistorial] = useState([]);
  const [alimentos, setAlimentos] = useState([]);
  const [fechaPlan, setFechaPlan] = useState("");
  const [mostrarEditor, setMostrarEditor] = useState(false);

  const [nuevoItem, setNuevoItem] = useState({
    alimento_id: "",
    comida: "",
    cantidad: ""
  });

  useEffect(() => {
    cargarPlan();
    cargarPlanesHistorial();
    cargarAlimentos();
  }, []);

  // ------------------------
  // CARGAS
  // ------------------------

  const cargarPlan = async () => {
    try {
      const res = await fetch(`${API}/pacientes/${id}/plan`);
      if (!res.ok) {
        setPlan(null);
        return;
      }
      const data = await res.json();
      setPlan(data);
      setMostrarEditor(true);
    } catch {
      setPlan(null);
    }
  };

  const cargarPlanesHistorial = async () => {
    const res = await fetch(`${API}/pacientes/${id}/planes`);
    const data = await res.json();
    setPlanesHistorial(data);
  };

  const cargarAlimentos = async () => {
    const res = await fetch(`${API}/alimentos`);
    const data = await res.json();
    setAlimentos(data);
  };

  // ------------------------
  // CREAR PLAN
  // ------------------------

  const crearPlan = async () => {
    if (!fechaPlan) {
      alert("Seleccionar fecha");
      return;
    }

    await fetch(`${API}/pacientes/${id}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: fechaPlan })
    });

    setFechaPlan("");
    setMostrarEditor(true);

    await cargarPlan();
    await cargarPlanesHistorial();
  };

  // ------------------------
  // AGREGAR ITEM
  // ------------------------

  const agregarAlimento = async () => {
    if (!nuevoItem.alimento_id || !nuevoItem.comida) {
      alert("Completar alimento y comida");
      return;
    }

    await fetch(`${API}/planes/${plan.plan_id}/alimentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoItem)
    });

    setNuevoItem({
      alimento_id: "",
      comida: "",
      cantidad: ""
    });

    cargarPlan();
  };

  const eliminarItem = async (item_id) => {
    await fetch(`${API}/plan_item/${item_id}`, {
      method: "DELETE"
    });

    cargarPlan();
  };

  // ------------------------
  // UI
  // ------------------------

  return (
    <div className="card">
      <h2>Plan Alimentario</h2>

      {/* CREAR PLAN */}
      {!plan && (
        <div className="plan-create">
          <h3>Crear nuevo plan</h3>
          <div className="row">
            <input
              type="date"
              value={fechaPlan}
              onChange={(e) => setFechaPlan(e.target.value)}
            />
            <button onClick={crearPlan} className="btn-primary">
              Crear Plan
            </button>
          </div>
        </div>
      )}

      {/* EDITOR DE PLAN */}
      {plan && (
        <>
          <div className="plan-header">
            <strong>Fecha:</strong> {plan.fecha}
          </div>

          {/* AGREGAR ALIMENTO */}
          <div className="plan-form">
            <select
              value={nuevoItem.alimento_id}
              onChange={(e) =>
                setNuevoItem({
                  ...nuevoItem,
                  alimento_id: e.target.value
                })
              }
            >
              <option value="">Seleccionar alimento</option>
              {alimentos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} ({a.categoria})
                </option>
              ))}
            </select>

            <input
              placeholder="Comida (Desayuno, Almuerzo...)"
              value={nuevoItem.comida}
              onChange={(e) =>
                setNuevoItem({ ...nuevoItem, comida: e.target.value })
              }
            />

            <input
              placeholder="Cantidad"
              value={nuevoItem.cantidad}
              onChange={(e) =>
                setNuevoItem({ ...nuevoItem, cantidad: e.target.value })
              }
            />

            <button onClick={agregarAlimento} className="btn-success">
              Agregar
            </button>
          </div>

          {/* LISTA DE ITEMS */}
          <div className="plan-items">
            {plan.alimentos.length === 0 && (
              <p className="muted">No hay alimentos cargados</p>
            )}

            {plan.alimentos.map((item) => (
              <div key={item.item_id} className="plan-item">
                <div>
                  <strong>{item.comida}</strong> – {item.nombre}
                  {item.cantidad && ` (${item.cantidad})`}
                </div>

                <button
                  onClick={() => eliminarItem(item.item_id)}
                  className="btn-danger"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          {/* PDF */}
          <div className="plan-actions">
            <a
              href={`${API}/pacientes/${id}/plan/pdf`}
              target="_blank"
              className="btn-secondary"
            >
              Exportar PDF
            </a>
          </div>

          {/* HISTORIAL */}
          <div className="plan-history">
            <h4>Planes anteriores</h4>
            {planesHistorial.map((p) => (
              <div key={p.id} className="history-item">
                {p.fecha}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
