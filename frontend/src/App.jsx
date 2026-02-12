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

  const [formPaciente, setFormPaciente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: "",
    cintura: "",
    diagnostico: ""
  });

  const [formVisita, setFormVisita] = useState({
    fecha: "",
    peso: "",
    cintura: ""
  });

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

  const crearPaciente = async () => {
    await fetch(`${API_URL}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPaciente)
    });

    setMostrarNuevo(false);
    setFormPaciente({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: "",
      cintura: "",
      diagnostico: ""
    });

    cargarPacientes();
  };

  const guardarCambiosPaciente = async () => {
    await fetch(`${API_URL}/pacientes/${pacienteActual.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pacienteActual)
    });

    alert("Paciente actualizado");
    cargarPacientes();
  };

  const crearVisita = async () => {
    await fetch(`${API_URL}/pacientes/${pacienteActual.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formVisita)
    });

    setFormVisita({ fecha: "", peso: "", cintura: "" });
    seleccionarPaciente(pacienteActual);
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

      {!pacienteActual && !mostrarNuevo && (
        <>
          <div className="top-bar">
            <input
              placeholder="Buscar paciente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={() => setMostrarNuevo(true)}
            >
              + Nuevo paciente
            </button>
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

      {mostrarNuevo && (
        <div className="card">
          <h2>Nuevo Paciente</h2>

          <div className="grid-3">
            {Object.keys(formPaciente).map((campo) => (
              <div key={campo}>
                <label>{campo}</label>
                <input
                  value={formPaciente[campo]}
                  onChange={(e) =>
                    setFormPaciente({
                      ...formPaciente,
                      [campo]: e.target.value
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="btn-row">
            <button className="btn-primary" onClick={crearPaciente}>
              Guardar
            </button>
            <button
              className="btn-secondary"
              onClick={() => setMostrarNuevo(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {pacienteActual && (
        <>
          <div className="card">
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
                <span>Peso</span>
                <h3>{pacienteActual.peso} kg</h3>
              </div>
              <div className="metric">
                <span>Cintura</span>
                <h3>{pacienteActual.cintura || "-"} cm</h3>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Datos del Paciente</h3>

            <div className="grid-3">
              {["nombre", "apellido", "dni", "edad", "altura", "peso", "cintura"].map((campo) => (
                <div key={campo}>
                  <label>{campo}</label>
                  <input
                    value={pacienteActual[campo] || ""}
                    onChange={(e) =>
                      setPacienteActual({
                        ...pacienteActual,
                        [campo]: e.target.value
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <label>Diagnóstico</label>
            <textarea
              rows="4"
              value={pacienteActual.diagnostico || ""}
              onChange={(e) =>
                setPacienteActual({
                  ...pacienteActual,
                  diagnostico: e.target.value
                })
              }
            />

            <div className="btn-row">
              <button
                className="btn-primary"
                onClick={guardarCambiosPaciente}
              >
                Guardar cambios
              </button>

              <button
                className="btn-secondary"
                onClick={() => setPacienteActual(null)}
              >
                ← Volver
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Evolución de Peso</h3>

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

          <div className="card">
            <h3>Historial</h3>

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

            <h4>Nueva visita</h4>

            <div className="grid-3">
              {["fecha", "peso", "cintura"].map((campo) => (
                <div key={campo}>
                  <label>{campo}</label>
                  <input
                    type={campo === "fecha" ? "date" : "text"}
                    value={formVisita[campo]}
                    onChange={(e) =>
                      setFormVisita({
                        ...formVisita,
                        [campo]: e.target.value
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={crearVisita}>
              Guardar visita
            </button>
          </div>
        </>
      )}
    </div>
  );
}
