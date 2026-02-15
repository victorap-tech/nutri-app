import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";
import { api } from "../api/api";

const COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"];

export default function PacientePlan() {
  const { id } = useParams();

  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [plan, setPlan] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [error, setError] = useState("");

  const [nuevoItem, setNuevoItem] = useState({
    alimento_id: "",
    comida: "Desayuno",
    cantidad: "",
  });

  // ---------------- CARGA INICIAL ----------------

  async function cargarPlan() {
    try {
      const data = await api.get(`/pacientes/${id}/plan`);
      setPlan(data);
    } catch {
      setPlan(null);
    }
  }

  async function cargarAlimentos() {
    try {
      const data = await api.get("/alimentos");
      setAlimentos(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    cargarPlan();
    cargarAlimentos();
  }, [id]);

  // ---------------- CREAR PLAN ----------------

  async function crearPlan() {
    setError("");
    try {
      await api.post(`/pacientes/${id}/plan`, {
        fecha: fecha,
      });
      await cargarPlan();
    } catch (e) {
      setError(e.message);
    }
  }

  // ---------------- AGREGAR ALIMENTO ----------------

  async function agregarAlimento() {
    if (!plan) return;

    try {
      await api.post(`/planes/${plan.plan_id}/alimentos`, nuevoItem);

      setNuevoItem({
        alimento_id: "",
        comida: "Desayuno",
        cantidad: "",
      });

      await cargarPlan();
    } catch (e) {
      setError(e.message);
    }
  }

  // ---------------- ELIMINAR ITEM ----------------

  async function eliminarItem(itemId) {
    try {
      await api.delete(`/plan_item/${itemId}`);
      await cargarPlan();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <TabsPaciente />

      <h2>Plan Alimentario</h2>

      {error && <div className="alert-error">{error}</div>}

      {/* CREAR PLAN */}
      <div className="card">
        <h3>Crear nuevo plan</h3>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <div className="actions">
          <button onClick={crearPlan}>Crear Plan</button>
        </div>
      </div>

      {/* PLAN ACTUAL */}
      <div className="card">
        <h3>Plan actual</h3>

        {!plan ? (
          <p className="muted">No hay plan activo.</p>
        ) : (
          <>
            <p>
              <strong>Fecha:</strong> {plan.fecha}
            </p>

            {/* AGREGAR ALIMENTO */}
            <div className="grid">
              <div>
                <label>Alimento</label>
                <select
                  value={nuevoItem.alimento_id}
                  onChange={(e) =>
                    setNuevoItem({
                      ...nuevoItem,
                      alimento_id: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar</option>
                  {alimentos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Comida</label>
                <select
                  value={nuevoItem.comida}
                  onChange={(e) =>
                    setNuevoItem({
                      ...nuevoItem,
                      comida: e.target.value,
                    })
                  }
                >
                  {COMIDAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Cantidad</label>
                <input
                  value={nuevoItem.cantidad}
                  onChange={(e) =>
                    setNuevoItem({
                      ...nuevoItem,
                      cantidad: e.target.value,
                    })
                  }
                />
              </div>

              <div className="actions">
                <button onClick={agregarAlimento}>
                  Agregar
                </button>
              </div>
            </div>

            {/* TABLA */}
            <table className="table">
              <thead>
                <tr>
                  <th>Comida</th>
                  <th>Alimento</th>
                  <th>Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plan.alimentos.map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.comida}</td>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad || "-"}</td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() =>
                          eliminarItem(item.item_id)
                        }
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PDF */}
            <div className="actions">
              <a
                href={`${import.meta.env.VITE_API_URL}/pacientes/${id}/plan/pdf`}
                target="_blank"
                rel="noreferrer"
              >
                <button>Descargar PDF</button>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
