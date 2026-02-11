import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [estadoBackend, setEstadoBackend] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [diagnostico, setDiagnostico] = useState("");

  // ---------- BACKEND STATUS ----------
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => setEstadoBackend(d.status))
      .catch(() => setEstadoBackend("Backend OFF"));
  }, []);

  // ---------- CARGAR PACIENTES ----------
  const cargarPacientes = () => {
    fetch(`${API}/pacientes`)
      .then(r => r.json())
      .then(d => setPacientes(d));
  };

  // ---------- NUEVO PACIENTE ----------
  function NuevoPaciente() {
    const [form, setForm] = useState({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: ""
    });

    const guardar = async () => {
      await fetch(`${API}/pacientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      setVista("pacientes");
      cargarPacientes();
    };

    return (
      <>
        <h2>Nuevo paciente</h2>

        {["nombre","apellido","dni","edad","altura","peso"].map(campo => (
          <input
            key={campo}
            placeholder={campo.toUpperCase()}
            type={campo === "edad" || campo === "peso" ? "number" : "text"}
            onChange={e => setForm({ ...form, [campo]: e.target.value })}
          />
        ))}

        <button className="primary" onClick={guardar}>
          Guardar paciente
        </button>
      </>
    );
  }

  // ---------- LISTA ----------
  function ListaPacientes() {
    useEffect(() => { cargarPacientes(); }, []);

    return (
      <>
        <h2>Pacientes</h2>

        <ul className="lista">
          {pacientes.map(p => (
            <li
              key={p.id}
              onClick={() => {
                setPacienteActivo(p);
                setDiagnostico(p.diagnostico || "");
                setVista("ficha");
              }}
            >
              <b>{p.apellido}, {p.nombre}</b><br />
              DNI {p.dni}
            </li>
          ))}
        </ul>
      </>
    );
  }

  // ---------- IMC ----------
  function calcularIMC(p) {
    const h = p.altura;
    return (p.peso / (h * h)).toFixed(1);
  }

  function rangoIMC(imc) {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  }

  function FichaPaciente() {
    const imc = calcularIMC(pacienteActivo);
    const rango = rangoIMC(imc);

    return (
      <div className="ficha-layout">

        {/* IZQUIERDA */}
        <div className="ficha">
          <h2>Ficha del paciente</h2>

          <p><b>Nombre:</b> {pacienteActivo.nombre}</p>
          <p><b>Apellido:</b> {pacienteActivo.apellido}</p>
          <p><b>DNI:</b> {pacienteActivo.dni}</p>
          <p><b>Edad:</b> {pacienteActivo.edad}</p>
          <p><b>Altura:</b> {pacienteActivo.altura} m</p>
          <p><b>Peso:</b> {pacienteActivo.peso} kg</p>

          {/* DIAGNÓSTICO */}
          <div className="diagnostico-box">
            <h3>Diagnóstico</h3>

            <textarea
              value={diagnostico}
              placeholder="Escriba el diagnóstico del paciente..."
              onChange={e => setDiagnostico(e.target.value)}
            />

            <button>Guardar diagnóstico</button>
          </div>

          <button onClick={() => setVista("pacientes")}>
            ← Volver
          </button>
        </div>

        {/* DERECHA IMC */}
        <div className="imc-card">
          <h3>IMC</h3>

          <div className="imc-valor">{imc}</div>
          <div className="imc-rango">{rango}</div>

          <div className="imc-bar">
            <div
              className="imc-indicador"
              style={{ left: `${Math.min(imc * 3, 100)}%` }}
            />
          </div>

          <small>Bajo | Normal | Sobrepeso | Obesidad</small>
        </div>

      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="app-container">
      <h1>Nutri App</h1>

      <div className="nav">
        <button onClick={() => setVista("inicio")}>Inicio</button>
        <button onClick={() => setVista("pacientes")}>Pacientes</button>
        <button onClick={() => setVista("nuevo")}>Nuevo</button>
      </div>

      {vista === "inicio" && (
        <p className={estadoBackend === "Nutri App OK" ? "ok" : "off"}>
          {estadoBackend}
        </p>
      )}

      {vista === "pacientes" && <ListaPacientes />}
      {vista === "nuevo" && <NuevoPaciente />}
      {vista === "ficha" && pacienteActivo && <FichaPaciente />}
    </div>
  );
}
