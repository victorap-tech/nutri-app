import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [formPaciente, setFormPaciente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: "",
    cintura: ""
  });

  const [formVisita, setFormVisita] = useState({
    fecha: "",
    peso: "",
    altura: "",
    cintura: "",
    diagnostico: ""
  });

  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const res = await fetch(`${API}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  const seleccionarPaciente = async (p) => {
    setPacienteActual(p);
    setMostrarNuevo(false);

    const res = await fetch(`${API}/pacientes/${p.id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  const crearPaciente = async () => {
    if (!formPaciente.cintura) {
      alert("La cintura es obligatoria");
      return;
    }

    await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPaciente)
    });

    setFormPaciente({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: "",
      cintura: ""
    });

    setMostrarNuevo(false);
    cargarPacientes();
  };

  const crearVisita = async () => {
    await fetch(`${API}/pacientes/${pacienteActual.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formVisita)
    });

    setFormVisita({
      fecha: "",
      peso: "",
      altura: "",
      cintura: "",
      diagnostico: ""
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

  const obtenerRangoIMC = (imc) => {
    if (!imc) return { label: "", color: "#ccc", width: 0 };

    if (imc < 18.5) return { label: "Bajo peso", color: "#3498db", width: 25 };
    if (imc < 25) return { label: "Normal", color: "#2ecc71", width: 50 };
    if (imc < 30) return { label: "Sobrepeso", color: "#f39c12", width: 75 };
    return { label: "Obesidad", color: "#e74c3c", width: 100 };
  };

  const imc = calcularIMC();
  const rango = obtenerRangoIMC(imc);

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {/* LISTA PACIENTES */}
      {!pacienteActual && !mostrarNuevo && (
        <>
          <button onClick={() => setMostrarNuevo(true)} className="btn">
            + Nuevo paciente
          </button>

          <div className="grid">
            {pacientes.map((p) => (
              <div
                key={p.id}
                className="card paciente-card"
                onClick={() => seleccionarPaciente(p)}
              >
                <h3>{p.nombre} {p.apellido}</h3>
                <p>DNI: {p.dni}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* NUEVO PACIENTE */}
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

          <button className="btn" onClick={crearPaciente}>
            Guardar
          </button>
          <button onClick={() => setMostrarNuevo(false)}>
            Cancelar
          </button>
        </div>
      )}

      {/* FICHA PACIENTE */}
      {pacienteActual && (
        <div className="perfil-layout">
          <div className="card perfil">
            <h2>{pacienteActual.nombre} {pacienteActual.apellido}</h2>
            <p><b>DNI:</b> {pacienteActual.dni}</p>
            <p><b>Edad:</b> {pacienteActual.edad}</p>
            <p><b>Altura:</b> {pacienteActual.altura} m</p>
            <p><b>Peso actual:</b> {pacienteActual.peso} kg</p>
            <p><b>Cintura actual:</b> {pacienteActual.cintura || "-"} cm</p>

            {imc && (
              <>
                <h3>IMC: {imc}</h3>
                <div className="imc-bar">
                  <div
                    className="imc-fill"
                    style={{
                      width: `${rango.width}%`,
                      background: rango.color
                    }}
                  ></div>
                </div>
                <p style={{ color: rango.color }}>{rango.label}</p>
              </>
            )}

            <button onClick={() => setPacienteActual(null)}>
              ← Volver
            </button>
          </div>

          {/* HISTORIAL */}
          <div className="card historial">
            <h2>Historial</h2>
            <div className="historial-scroll">
              {visitas.map((v) => (
                <div key={v.id} className="visita-card">
                  <h4>{v.fecha}</h4>
                  <p>Peso: {v.peso} kg</p>
                  <p>Cintura: {v.cintura} cm</p>
                  <p>Diagnóstico: {v.diagnostico}</p>
                </div>
              ))}
            </div>

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
