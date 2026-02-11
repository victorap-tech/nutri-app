import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: "",
    cintura: ""
  });

  const [nuevaVisita, setNuevaVisita] = useState({
    fecha: "",
    peso: "",
    altura: "",
    cintura: "",
    diagnostico: ""
  });

  // ---------------- CARGAR PACIENTES ----------------
  const cargarPacientes = async () => {
    const res = await fetch(`${API}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  // ---------------- CARGAR VISITAS ----------------
  const cargarVisitas = async (id) => {
    const res = await fetch(`${API}/pacientes/${id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  useEffect(() => {
    if (pacienteActivo) {
      cargarVisitas(pacienteActivo.id);
    }
  }, [pacienteActivo]);

  // ---------------- CREAR PACIENTE ----------------
  const guardarPaciente = async () => {
    await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPaciente)
    });

    setMostrarNuevo(false);
    setNuevoPaciente({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: "",
      cintura: ""
    });

    cargarPacientes();
  };

  // ---------------- CREAR VISITA ----------------
  const guardarVisita = async () => {
    await fetch(`${API}/pacientes/${pacienteActivo.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaVisita)
    });

    setNuevaVisita({
      fecha: "",
      peso: "",
      altura: "",
      cintura: "",
      diagnostico: ""
    });

    cargarVisitas(pacienteActivo.id);
  };

  // ---------------- IMC ----------------
  const pesoActual =
    visitas.length > 0 ? visitas[0].peso : pacienteActivo?.peso;

  const alturaActual =
    visitas.length > 0 && visitas[0].altura
      ? visitas[0].altura
      : pacienteActivo?.altura;

  const cinturaActual =
    visitas.length > 0 ? visitas[0].cintura : pacienteActivo?.cintura;

  const imc =
    pesoActual && alturaActual
      ? (pesoActual / (alturaActual * alturaActual)).toFixed(2)
      : null;

  const getRangoIMC = (valor) => {
    if (!valor) return { texto: "-", color: "#ccc" };
    if (valor < 18.5) return { texto: "Bajo peso", color: "#3498db" };
    if (valor < 25) return { texto: "Normal", color: "#2ecc71" };
    if (valor < 30) return { texto: "Sobrepeso", color: "#f39c12" };
    return { texto: "Obesidad", color: "#e74c3c" };
  };

  const rangoIMC = getRangoIMC(parseFloat(imc));

  return (
    <div className="layout">
      
      {/* ---------- COLUMNA PACIENTES ---------- */}
      <div className="col pacientes">
        <h2>Pacientes</h2>
        <button className="primary" onClick={() => setMostrarNuevo(true)}>
          + Nuevo paciente
        </button>

        {pacientes.map((p) => (
          <div
            key={p.id}
            className={`paciente-item ${
              pacienteActivo?.id === p.id ? "activo" : ""
            }`}
            onClick={() => setPacienteActivo(p)}
          >
            {p.apellido}, {p.nombre}
          </div>
        ))}
      </div>

      {/* ---------- COLUMNA FICHA ---------- */}
      <div className="col ficha">
        {pacienteActivo && (
          <>
            <h2>
              {pacienteActivo.apellido}, {pacienteActivo.nombre}
            </h2>

            <p>DNI: {pacienteActivo.dni}</p>
            <p>Edad: {pacienteActivo.edad}</p>
            <p>Altura: {alturaActual} m</p>
            <p>Peso actual: {pesoActual} kg</p>
            <p>Cintura actual: {cinturaActual || "-"} cm</p>

            <h3>IMC: {imc}</h3>

            <div className="barra-imc">
              <div
                className="progreso"
                style={{
                  width: `${Math.min(imc * 3, 100)}%`,
                  backgroundColor: rangoIMC.color
                }}
              ></div>
            </div>

            <p style={{ color: rangoIMC.color }}>{rangoIMC.texto}</p>
          </>
        )}

        {mostrarNuevo && (
          <div className="card">
            <h3>Nuevo paciente</h3>

            {Object.keys(nuevoPaciente).map((campo) => (
              <input
                key={campo}
                placeholder={campo}
                value={nuevoPaciente[campo]}
                onChange={(e) =>
                  setNuevoPaciente({
                    ...nuevoPaciente,
                    [campo]: e.target.value
                  })
                }
              />
            ))}

            <button className="primary" onClick={guardarPaciente}>
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* ---------- COLUMNA HISTORIAL ---------- */}
      <div className="col historial">
        {pacienteActivo && (
          <>
            <h2>Historial</h2>

            {visitas.map((v) => (
              <div key={v.id} className="card">
                <strong>{v.fecha}</strong>
                <p>Peso: {v.peso} kg</p>
                <p>Cintura: {v.cintura} cm</p>
                <p>Diagnóstico: {v.diagnostico}</p>
              </div>
            ))}

            <div className="card">
              <h3>Nueva visita</h3>

              {Object.keys(nuevaVisita).map((campo) => (
                campo !== "diagnostico" ? (
                  <input
                    key={campo}
                    type={campo === "fecha" ? "date" : "number"}
                    placeholder={campo}
                    value={nuevaVisita[campo]}
                    onChange={(e) =>
                      setNuevaVisita({
                        ...nuevaVisita,
                        [campo]: e.target.value
                      })
                    }
                  />
                ) : (
                  <textarea
                    key={campo}
                    placeholder="Diagnóstico"
                    value={nuevaVisita.diagnostico}
                    onChange={(e) =>
                      setNuevaVisita({
                        ...nuevaVisita,
                        diagnostico: e.target.value
                      })
                    }
                  />
                )
              ))}

              <button className="primary" onClick={guardarVisita}>
                Guardar visita
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
