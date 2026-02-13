import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function PacienteEvolucion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    api.getVisitas(id).then(setVisitas);
  }, [id]);

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="btn-secondary">
        ← Volver
      </button>

      <h1>Evolución</h1>

      {visitas.map(v => (
        <div key={v.id} className="card">
          <p><b>Fecha:</b> {v.fecha}</p>
          <p><b>Peso:</b> {v.peso}</p>
          <p><b>Altura:</b> {v.altura}</p>
          <p><b>Diagnóstico:</b> {v.diagnostico}</p>
        </div>
      ))}
    </div>
  );
}
