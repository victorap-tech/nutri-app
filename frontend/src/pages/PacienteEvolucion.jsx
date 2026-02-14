import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PacienteEvolucion() {
  const { id } = useParams();
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}/visitas`)
      .then(res => res.json())
      .then(data => setVisitas(data));
  }, [id]);

  return (
    <div className="card">
      <h3>Historial de visitas</h3>
      {visitas.map(v => (
        <div key={v.id} className="item">
          <p>{v.fecha} - {v.peso} kg</p>
        </div>
      ))}
    </div>
  );
}
