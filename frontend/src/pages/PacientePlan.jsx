import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";
import { api } from "../api/api";

export default function PacientePlan() {
  const { id } = useParams();

  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const data = await api.get(`/pacientes/${id}/plan`);
      setPlan(data);
    } catch {
      setPlan(null);
    }
  }

  useEffect(() => {
    cargar();
  }, [id]);

  async function crearPlan() {
    setError("");
    try {
      await api.post(`/pacientes/${id}/plan`, {
        fecha: fecha,
      });

      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <TabsPaciente />

      <h2>Plan Alimentario</h2>

      {error && <div className="alert-error">{error}</div>}

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

      <div className="card">
        <h3>Plan actual</h3>

        {!plan ? (
          <p className="muted">No hay plan activo.</p>
        ) : (
          <>
            <p><strong>Fecha:</strong> {plan.fecha}</p>
            <p><strong>ID:</strong> {plan.plan_id}</p>
          </>
        )}
      </div>
    </div>
  );
}
