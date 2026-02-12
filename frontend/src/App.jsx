import { useEffect, useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const res = await fetch(`${API_URL}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  const seleccionarPaciente = async (p) => {
    setPacienteActual(p);
    setMostrarNuevo(false);

    const res = await fetch(`${API_URL}/pacientes/${p.id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  const calcularIMC = () => {
    if (!pacienteActual?.peso || !pacienteActual?.altura) return null;
    return (
      pacienteActual.peso /
      (pacienteActual.altura * pacienteActual.altura)
    ).toFixed(2);
  };

  const obtenerEstadoIMC = (imc) => {
    if (!imc) return "";
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  };

  const imc = calcularIMC();
  const estadoIMC = obtenerEstadoIMC(imc);

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {!pacienteActual && (
        <>
          <div className="top-bar">
            <input
              placeholder="Buscar paciente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="resultados">
            {pacientesFiltrados.map((p) => (
              <div
                key={p.id}
                className="resultado-item"
                onClick={() => seleccionarPaciente(p)}
              >
                {p.apellido}, {p.nombre} — DNI: {p.dni}
              </div>
            ))}
          </div>
        </>
      )}

      {pacienteActual && (
        <>
          {/* DASHBOARD */}
          <div className="card dashboard">
            <h2>
              {pacienteActual.nombre} {pacienteActual.apellido}
            </h2>

            <div className="dashboard-grid">
              <div className="metric">
                <span>IMC</span>
                <h3>{imc}</h3>
                <small>{estadoIMC}</small>
              </div>

              <div className="metric">
                <span>Peso actual</span>
                <h3>{pacienteActual.peso} kg</h3>
              </div>

              <div className="metric">
                <span>Cintura</span>
                <h3>{pacienteActual.cintura || "-"} cm</h3>
              </div>
            </div>
          </div>

          {/* GRAFICO */}
          <div className="card">
            <h2>Evolución de Peso</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#2ecc71"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* HISTORIAL */}
          <div className="card">
            <h2>Historial de Visitas</h2>

            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Peso</th>
                    <th>Cintura</th>
                  </tr>
                </thead>
                <tbody>
                  {visitas.map((v) => (
                    <tr key={v.id}>
                      <td>{v.fecha}</td>
                      <td>{v.peso}</td>
                      <td>{v.cintura}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            className="btn-secondary"
            onClick={() => setPacienteActual(null)}
          >
            ← Volver
          </button>
        </>
      )}
    </div>
  );
}
