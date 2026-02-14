import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PacientePlan() {
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [fechaPlan, setFechaPlan] = useState("");
  const [comida, setComida] = useState("Desayuno");
  const [alimentoId, setAlimentoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    cargarPlan();
    cargarAlimentos();
  }, [id]);

  const cargarPlan = async () => {
    try {
      const res = await fetch(`${API}/pacientes/${id}/plan`);
      if (!res.ok) {
        setPlan(null);
        return;
      }
      const data = await res.json();
      setPlan(data);
    } catch {
      setPlan(null);
    }
  };

  const cargarAlimentos = async () => {
    const res = await fetch(`${API}/alimentos`);
    const data = await res.json();
    setAlimentos(data);
  };

  const crearPlan = async () => {
    if (!fechaPlan) return alert("Seleccione fecha");

    await fetch(`${API}/pacientes/${id}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: fechaPlan }),
    });

    setFechaPlan("");
    cargarPlan();
  };

  const agregarAlimento = async () => {
    if (!alimentoId || !comida) return alert("Complete datos");

    await fetch(`${API}/planes/${plan.plan_id}/alimentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alimento_id: alimentoId,
        comida,
        cantidad,
      }),
    });

    setCantidad("");
    cargarPlan();
  };

  const eliminarItem = async (itemId) => {
    await fetch(`${API}/plan_item/${itemId}`, {
      method: "DELETE",
    });
    cargarPlan();
  };

  const copiarPlan = async () => {
    const nuevaFecha = prompt("Ingrese fecha nuevo plan (YYYY-MM-DD)");
    if (!nuevaFecha) return;

    await fetch(`${API}/pacientes/${id}/plan/copiar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: nuevaFecha }),
    });

    cargarPlan();
  };

  const exportarPDF = () => {
    window.open(`${API}/pacientes/${id}/plan/pdf`, "_blank");
  };

  const agruparPorComida = () => {
    if (!plan?.alimentos) return {};

    return plan.alimentos.reduce((acc, item) => {
      if (!acc[item.comida]) acc[item.comida] = [];
      acc[item.comida].push(item);
      return acc;
    }, {});
  };

  const agrupado = agruparPorComida();

  return (
    <div className="card">
      <h2>Plan Alimentario</h2>

      {!plan && (
        <div className="crear-plan">
          <h3>Crear nuevo plan</h3>
          <input
            type="date"
            value={fechaPlan}
            onChange={(e) => setFechaPlan(e.target.value)}
          />
          <button onClick={crearPlan} className="btn-primary">
            Crear Plan
          </button>
        </div>
      )}

      {plan && (
        <>
          <div className="plan-header">
            <span>Fecha: {plan.fecha}</span>
            <div>
              <button onClick={copiarPlan} className="btn-secondary">
                Copiar plan anterior
              </button>
              <button onClick={exportarPDF} className="btn-success">
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="agregar-alimento">
            <select
              value={comida}
              onChange={(e) => setComida(e.target.value)}
            >
              <option>Desayuno</option>
              <option>Almuerzo</option>
              <option>Merienda</option>
              <option>Cena</option>
            </select>

            <select
              value={alimentoId}
              onChange={(e) => setAlimentoId(e.target.value)}
            >
              <option value="">Seleccione alimento</option>
              {alimentos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />

            <button onClick={agregarAlimento} className="btn-primary">
              Agregar
            </button>
          </div>

          {Object.keys(agrupado).map((tipo) => (
            <div key={tipo} className="bloque-comida">
              <h3>{tipo}</h3>
              {agrupado[tipo].map((item) => (
                <div key={item.item_id} className="item-plan">
                  <span>
                    {item.nombre} {item.cantidad && `- ${item.cantidad}`}
                  </span>
                  <button
                    onClick={() => eliminarItem(item.item_id)}
                    className="btn-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
