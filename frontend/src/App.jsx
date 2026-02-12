import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [busqueda, setBusqueda] = useState("");

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

    setFormVisita({
      fecha: "",
      peso: "",
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

  const obtenerPosicionIMC = (imc) => {
    if (!imc) return 0;
    if (imc < 18.5) return 20;
    if (imc < 25) return 40;
    if (imc < 30) return 70;
    return 90;
  };

  const imc = calcularIMC();
  const posicionIMC = obtenerPosicionIMC(imc);

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {/* BUSCADOR SOLO SI NO ESTÁ EN FICHA */}
      {!pacienteActual && !mostrarNuevo && (
        <div className="top-bar">
          <input
            type="text"
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
      )}

      {/* RESULTADOS */}
      {!pacienteActual && !mostrarNuevo && (
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
      )}

      {/* NUEVO PACIENTE */}
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

      {/* FICHA PACIENTE */}
      {pacienteActual && (
        <>
          <div className="card">
            <h2>Ficha del Paciente</h2>

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

            <div className="diagnostico-box">
              <label>Diagnóstico Clínico</label>
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
            </div>

            {/* IMC PRO */}
            {imc && (
              <div className="imc-card">
                <div className="imc-header">
                  <span>IMC</span>
                  <span className="imc-value">{imc}</span>
                </div>

                <div className="imc-bar-wrapper">
                  <div className="imc-bar-gradient"></div>
                  <div
                    className="imc-indicator"
                    style={{ left: `${posicionIMC}%` }}
                  ></div>
                </div>
              </div>
            )}

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

          {/* HISTORIAL */}
          <div className="card">
            <h2>Historial de Visitas</h2>

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

            <h3>Nueva visita</h3>

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

            <div className="btn-row">
              <button className="btn-primary" onClick={crearVisita}>
                Guardar visita
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
