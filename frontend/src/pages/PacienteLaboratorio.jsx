import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PacienteLaboratorio() {
  const { id } = useParams();
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}/laboratorio`)
      .then(res => res.json())
      .then(data => setLabs(data));
  }, [id]);

  return (
    <div className="card">
      <h3>Laboratorios</h3>
      {labs.map(l => (
        <div key={l.id}>
          <p>{l.fecha} - Glucosa: {l.glucosa}</p>
        </div>
      ))}
    </div>
  );
}
