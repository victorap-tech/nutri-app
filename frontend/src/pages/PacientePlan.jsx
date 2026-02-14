import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api";

const COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];

export default function PacientePlan() {
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [fecha, setFecha] = useState("");
  const [nuevoAlimento, setNuevoAlimento] = useState({
    alimento_id: "",
    comida: "Desayuno",
    cantidad: ""
  });

  useEffect(() => {
    cargarPlan();
    cargarAlimentos();
  }, []);

  async function cargarPlan() {
    try {
      const data = await api.get(`/pacientes/${id}/plan`);
      setPlan(data);
    } catch (err) {
      setPlan(null);
    }
  }

  async function cargarAlimentos() {
    const data = await api.get("/alimentos");
    setAlimentos(data);
  }

  async function crearPlan() {
    if (!fecha) return;

    await api.post(`/pacientes/${id}/plan`, { fecha });
    setFecha("");
    cargarPlan();
  }

  async function agregarAlimento() {
    if (!plan) return;

    await api.post(`/planes/${plan.plan_id}/alimentos`, nuevoAlimento);

    setNuevoAlimento({
      alimento_id: "",
      comida: "Desayuno",
      cantidad: ""
    });

    cargarPlan();
  }

  async function eliminarItem(item_id) {
    await api.delete(`/plan_item/${item_id}`);
    cargarPlan();
  }

  return (
    <div className="container">
      <h2>Plan Alimentario</h2>

      {!plan && (
        <div>
          <h3>Crear nuevo plan</h3>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <button onClick={crearPlan}>Crear Plan</button>
        </div>
      )}

      {plan && (
        <>
          <h3>Plan activo - {plan.fecha}</h3>

          <div className="form-row">
            <select
              value={nuevoAlimento.alimento_id}
              onChange={(e) =>
                setNuevoAlimento({
                  ...nuevoAlimento,
                  alimento_id: e.target.value
                })
              }
            >
              <option value="">Seleccionar alimento</option>
              {alimentos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>

            <select
              value={nuevoAlimento.comida}
              onChange={(e) =>
                setNuevoAlimento({
                  ...nuevoAlimento,
                  comida: e.target.value
                })
              }
            >
              {COMIDAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Cantidad"
              value={nuevoAlimento.cantidad}
              onChange={(e) =>
                setNuevoAlimento({
                  ...nuevoAlimento,
                  cantidad: e.target.value
                })
              }
            />

            <button onClick={agregarAlimento}>Agregar</button>
          </div>

          <ul>
            {plan.alimentos.map((item) => (
              <li key={item.item_id}>
                {item.comida} - {item.nombre} ({item.cantidad})
                <button onClick={() => eliminarItem(item.item_id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <a
            href={`${import.meta.env.VITE_API_URL}/pacientes/${id}/plan/pdf`}
            target="_blank"
          >
            Descargar PDF
          </a>
        </>
      )}
    </div>
  );
}
