import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/pacientes")
      .then(res => res.json())
      .then(data => setPacientes(data));
  }, []);

  const pacientesFiltrados = pacientes.filter(p =>
    (p.nombre + " " + p.apellido + " " + p.dni)
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Pacientes</h2>

      <button onClick={() => navigate("/nuevo")}>
        + Nuevo paciente
      </button>

      <div className="search-bar">
        <input
          placeholder="Buscar paciente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="grid">
        {pacientesFiltrados.map(p => (
          <div className="card" key={p.id}>
            <div className="card-title">
              {p.nombre} {p.apellido}
            </div>

            <div className="card-info">
              DNI: {p.dni} <br />
              Edad: {p.edad} <br />
              Peso actual: {p.peso} kg
            </div>

            <div className="card-actions">
              <button onClick={() => navigate(`/pacientes/${p.id}`)}>
                Ver ficha
              </button>

              <button
                className="danger"
                onClick={() => {
                  fetch(`/pacientes/${p.id}`, {
                    method: "DELETE"
                  }).then(() =>
                    setPacientes(pacientes.filter(x => x.id !== p.id))
                  );
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
