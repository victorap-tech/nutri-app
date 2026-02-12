import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/pacientes`)
      .then((res) => res.json())
      .then((data) => setPacientes(data))
      .catch((err) => console.error("Error cargando pacientes:", err));
  }, []);

  return (
    <div className="container">
      <h1>Pacientes</h1>

      {pacientes.map((p) => (
        <div key={p.id} className="card">
          <Link to={`/paciente/${p.id}`}>
            {p.nombre} {p.apellido}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Home;
