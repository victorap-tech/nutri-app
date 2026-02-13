import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function NuevaVisita() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [peso, setPeso] = useState("");
  const [cintura, setCintura] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const guardar = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_URL}/pacientes/${id}/visitas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          peso: parseFloat(peso),
          cintura: cintura ? parseFloat(cintura) : null,
          diagnostico,
          observaciones,
        }),
      });

      navigate(`/paciente/${id}`);
    } catch (error) {
      console.error("Error guardando visita:", error);
    }
  };

  return (
    <div className="container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>Nueva Visita</h1>

      <form onSubmit={guardar} className="form-grid">
        <input
          type="number"
          placeholder="Peso (kg)"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Cintura (cm)"
          value={cintura}
          onChange={(e) => setCintura(e.target.value)}
        />

        <textarea
          placeholder="Diagnóstico de la visita"
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
        />

        <textarea
          placeholder="Observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <button type="submit" className="btn-primary">
          Guardar Visita
        </button>
      </form>
    </div>
  );
}
