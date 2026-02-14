import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch(`${API}/pacientes`)
      .then(res => res.json())
      .then(data => setPacientes(data));
  }, []);

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2>Pacientes</h2>

      <Link to="/nuevo">
        <button className="btn-primary">+ Nuevo paciente</button>
      </Link>

      <input
        type="text"
        placeholder="Buscar paciente..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="input-search"
      />

      <div className="list">
        {pacientesFiltrados.map(p => (
          <Link key={p.id} to={`/pacientes/${p.id}`} className="card">
            <strong>{p.nombre}, {p.apellido}</strong>
            <div>DNI: {p.dni}</div>
            <div>Edad: {p.edad} | Peso: {p.peso} kg</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
