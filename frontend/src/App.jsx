import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [nuevaVisita, setNuevaVisita] = useState({
    fecha: "",
    peso: "",
    altura: "",
    cintura: ""
  });

  useEffect(() => {
    fetch(`${API_URL}/pacientes`)
      .then(res => res.json())
      .then(data => setPacientes(data));
  }, []);

  const cargarPaciente = (p) => {
    setPacienteSeleccionado(p);
    fetch(`${API_URL}/visitas/${p.id}`)
      .then(res => res.json())
      .then(data => setHistorial(data));
  };

  const guardarVisita = async () => {
    await fetch(`${API_URL}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente_id: pacienteSeleccionado.id,
        ...nuevaVisita
      })
    });

    cargarPaciente(pacienteSeleccionado);
    setNuevaVisita({ fecha: "", peso: "", altura: "", cintura: "" });
  };

  const calcularIMC = () => {
    if (!pacienteSeleccionado?.altura || !historial.length) return null;
    const ultimoPeso = historial[0].peso;
    const altura = pacienteSeleccionado.altura;
    return (ultimoPeso / (altura * altura)).toFixed(2);
  };

  const getIMCColor = (imc) => {
    if (!imc) return "#ccc";
    if (imc < 18.5) return "#3b82f6";
    if (imc < 25) return "#22c55e";
    if (imc < 30) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="container">

      <h1>Nutri App</h1>

      {/* BUSCADOR */}
      {!pacienteSeleccionado && (
        <div className="buscador">
          <input
            placeholder="Buscar paciente por nombre o DNI..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div className="dropdown">
            {pacientes
              .filter(p =>
                `${p.nombre} ${p.apellido} ${p.dni}`
                  .toLowerCase()
                  .includes(busqueda.toLowerCase())
              )
              .map(p => (
                <div
                  key={p.id}
                  onClick={() => cargarPaciente(p)}
                  className="dropdown-item"
                >
                  {p.nombre} {p.apellido} - DNI {p.dni}
                </div>
              ))}
          </div>
        </div>
      )}

      {pacienteSeleccionado && (
        <>
          {/* FICHA */}
          <div className="card">
            <h2>Ficha del paciente</h2>

            <div className="form-grid">
              <div>
                <label>Nombre</label>
                <input value={pacienteSeleccionado.nombre} readOnly />
              </div>
              <div>
                <label>Apellido</label>
                <input value={pacienteSeleccionado.apellido} readOnly />
              </div>
              <div>
                <label>DNI</label>
                <input value={pacienteSeleccionado.dni} readOnly />
              </div>
              <div>
                <label>Altura (m)</label>
                <input value={pacienteSeleccionado.altura} readOnly />
              </div>
            </div>

            {calcularIMC() && (
              <div className="imc-box">
                <h3>IMC: {calcularIMC()}</h3>
                <div className="imc-bar">
                  <div
                    className="imc-progress"
                    style={{
                      width: `${Math.min(calcularIMC() * 2, 100)}%`,
                      background: getIMCColor(calcularIMC())
                    }}
                  />
                </div>
              </div>
            )}

            <button
              className="btn-secondary"
              onClick={() => setPacienteSeleccionado(null)}
            >
              ← Volver
            </button>
          </div>

          {/* HISTORIAL */}
          <div className="card">
            <h2>Historial</h2>

            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>Altura (m)</th>
                  <th>Cintura (cm)</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((v, i) => (
                  <tr key={i}>
                    <td>{v.fecha}</td>
                    <td>{v.peso}</td>
                    <td>{v.altura}</td>
                    <td>{v.cintura}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Nueva visita</h3>

            <div className="visita-grid">
              <input
                type="date"
                value={nuevaVisita.fecha}
                onChange={e =>
                  setNuevaVisita({ ...nuevaVisita, fecha: e.target.value })
                }
              />
              <input
                placeholder="Peso"
                value={nuevaVisita.peso}
                onChange={e =>
                  setNuevaVisita({ ...nuevaVisita, peso: e.target.value })
                }
              />
              <input
                placeholder="Altura"
                value={nuevaVisita.altura}
                onChange={e =>
                  setNuevaVisita({ ...nuevaVisita, altura: e.target.value })
                }
              />
              <input
                placeholder="Cintura"
                value={nuevaVisita.cintura}
                onChange={e =>
                  setNuevaVisita({ ...nuevaVisita, cintura: e.target.value })
                }
              />
              <button className="btn-primary" onClick={guardarVisita}>
                Guardar visita
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
