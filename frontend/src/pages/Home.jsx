import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/pacientes`)
      .then(res => res.json())
      .then(data => setPacientes(data))
      .catch(err => console.error("Error cargando pacientes:", err));
  }, []);

  const filtrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="home-container">
      <h1 className="titulo-principal">Nutri App</h1>

      <div className="buscador-box">
        <input
          type="text"
          placeholder="Buscar paciente por nombre o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-buscador"
        />

        {busqueda && (
          <div className="resultados">
            {filtrados.length > 0 ? (
              filtrados.map(p => (
                <div
                  key={p.id}
                  className="resultado-item"
                  onClick={() => navigate(`/paciente/${p.id}`)}
                >
                  {p.nombre} {p.apellido} - DNI {p.dni}
                </div>
              ))
            ) : (
              <div className="sin-resultados">
                No se encontraron pacientes
              </div>
            )}
          </div>
        )}
      </div>

      <button
        className="btn-nuevo"
        onClick={() => navigate("/paciente/nuevo")}
      >
        + Nuevo Paciente
      </button>
    </div>
  );
}

export default Home;
