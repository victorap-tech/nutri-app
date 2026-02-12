import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/pacientes`)
      .then((res) => res.json())
      .then((data) => setPacientes(data))
      .catch((err) => console.error("Error cargando pacientes:", err));
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="home-container">

      <div className="home-header">
        <h1>Pacientes</h1>
        <button
          className="btn-principal"
          onClick={() => navigate("/nuevo")}
        >
          + Nuevo Paciente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o DNI..."
        className="input-busqueda"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="lista-pacientes">
        {pacientesFiltrados.length === 0 && (
          <div className="sin-resultados">
            No se encontraron pacientes
          </div>
        )}

        {pacientesFiltrados.map((p) => (
          <div
            key={p.id}
            className="paciente-item"
            onClick={() => navigate(`/paciente/${p.id}`)}
          >
            <div className="paciente-nombre">
              {p.nombre} {p.apellido}
            </div>
            <div className="paciente-dni">
              DNI: {p.dni}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;
