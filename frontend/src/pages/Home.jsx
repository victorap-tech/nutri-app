import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/pacientes`)
      .then(res => res.json())
      .then(data => setPacientes(data));
  }, []);

  const filtrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">
      <div className="page-title">Pacientes</div>

      <div className="top-bar">
        <input
          className="search-input"
          placeholder="Buscar paciente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        <button
          className="btn-primary"
          onClick={() => navigate("/nuevo")}
        >
          + Nuevo Paciente
        </button>
      </div>

      {filtrados.map(p => (
        <div
          key={p.id}
          className="patient-card"
          onClick={() => navigate(`/pacientes/${p.id}`)}
        >
          <div className="patient-name">
            {p.apellido}, {p.nombre}
          </div>

          <div className="patient-info">
            DNI: {p.dni} | Edad: {p.edad} | Peso: {p.peso} kg
          </div>
        </div>
      ))}
    </div>
  );
}
