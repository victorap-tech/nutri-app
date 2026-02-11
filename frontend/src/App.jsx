import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteActual, setPacienteActual] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

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
    altura: "",
    cintura: ""
  });

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

  const crearVisita = async () => {
    await fetch(`${API_URL}/pacientes/${pacienteActual.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formVisita)
    });

    setFormVisita({
      fecha: "",
      peso: "",
      altura: "",
      cintura: ""
    });

    seleccionarPaciente(pacienteActual);
  };

  const calcularIMC = () => {
    if (!pacienteActual?.peso || !pacienteActual?.altura) return null;
    return (
      pacienteActual.peso /
      (pacienteActual.altura * pacienteActual.altura)
    ).toFixed(2);
  };

  const obtenerColorIMC = (imc) => {
    if (!imc) return "#ccc";
    if (imc < 18.5) return "#3498db";
    if (imc < 25) return "#2ecc71";
    if (imc < 30) return "#f39c12";
    return "#e74c3c";
  };

  const imc = calcularIMC();
  const colorIMC = obtenerColorIMC(imc);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dni.includes(busqueda)
  );

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {!pacienteActual && !mostrarNuevo && (
        <>
          <div className="top-bar">
            <input
              className="search"
              placeholder="Buscar paciente por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <button className="btn" onClick={() => setMostrarNuevo(true)}>
              + Nuevo paciente
            </button>
          </div>

          {busqueda && (
            <div className="dropdown">
              {pacientesFiltrados.map((p) => (
                <div
                  key={p.id}
                  className="dropdown-item"
                  onClick={() => seleccionarPaciente(p)}
                >
                  {p.nombre} {p.apellido} - DNI {p.dni}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mostrarNuevo && (
        <div className="card form-card">
          <h2>Nuevo paciente</h2>

          {Object.keys(formPaciente).map((campo) => (
            <input
              key={campo}
              placeholder={campo}
              value={formPaciente[campo]}
              onChange={(e) =>
                setFormPaciente({
                  ...formPaciente,
                  [campo]: e.target.value
                })
              }
            />
          ))}

          <div className="actions">
            <button className="btn" onClick={crearPaciente}>
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
        <div className="layout">
          <div className="card perfil">
            <h2>Ficha del paciente</h2>

            {Object.keys(formPaciente).map((campo) => (
              <input
                key={campo}
                value={pacienteActual[campo] || ""}
                onChange={(e) =>
                  setPacienteActual({
                    ...pacienteActual,
                    [campo]: e.target.value
                  })
                }
              />
            ))}

            {imc && (
              <>
                <div className="imc-container">
                  <h3>IMC: {imc}</h3>
                  <div className="imc-bar">
                    <div
                      className="imc-fill"
                      style={{
                        width: `${Math.min(imc * 2, 100)}%`,
                        backgroundColor: colorIMC
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <button className="btn-secondary" onClick={() => setPacienteActual(null)}>
              ← Volver
            </button>
          </div>

          <div className="card historial">
            <h2>Historial</h2>

            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Altura</th>
                  <th>Cintura</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.peso}</td>
                    <td>{v.altura}</td>
                    <td>{v.cintura}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Nueva visita</h3>

            {Object.keys(formVisita).map((campo) => (
              <input
                key={campo}
                type={campo === "fecha" ? "date" : "text"}
                placeholder={campo}
                value={formVisita[campo]}
                onChange={(e) =>
                  setFormVisita({
                    ...formVisita,
                    [campo]: e.target.value
                  })
                }
              />
            ))}

            <button className="btn" onClick={crearVisita}>
              Guardar visita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
