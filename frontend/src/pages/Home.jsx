import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.getPacientes().then(setPacientes);
  }, []);

  const filtrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Pacientes</h1>
        <button onClick={() => navigate("/nuevo")} className="btn-primary">
          Nuevo Paciente
        </button>
      </div>

      <input
        placeholder="Buscar paciente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search"
      />

      <div className="list">
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="card clickable"
            onClick={() => navigate(`/paciente/${p.id}`)}
          >
            {p.nombre} {p.apellido}
          </div>
        ))}
      </div>
    </div>
  );
}
