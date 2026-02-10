import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [estadoBackend, setEstadoBackend] = useState("");
  const [pacientes, setPacientes] = useState([]);

  // ---------- CHEQUEO BACKEND ----------
  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setEstadoBackend(data.status))
      .catch(() => setEstadoBackend("Backend OFF"));
  }, []);

  // ---------- CARGAR PACIENTES ----------
  const cargarPacientes = () => {
    fetch(`${API}/pacientes`)
      .then(res => res.json())
      .then(data => setPacientes(data));
  };

  // ---------- COMPONENTE NUEVO PACIENTE ----------
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

      alert("Paciente cargado correctamente");
      setVista("pacientes");
      cargarPacientes();
    };

    return (
      <>
        <h2>Nuevo paciente</h2>

        <input placeholder="Nombre"
          onChange={e => setForm({ ...form, nombre: e.target.value })} />

        <input placeholder="Apellido"
          onChange={e => setForm({ ...form, apellido: e.target.value })} />

        <input placeholder="DNI"
          onChange={e => setForm({ ...form, dni: e.target.value })} />

        <input placeholder="Edad" type="number"
          onChange={e => setForm({ ...form, edad: e.target.value })} />

        <input placeholder="Altura (m)"
          onChange={e => setForm({ ...form, altura: e.target.value })} />

        <input placeholder="Peso (kg)"
          onChange={e => setForm({ ...form, peso: e.target.value })} />

        <button className="primary" onClick={guardar}>
          Guardar paciente
        </button>
      </>
    );
  }

  // ---------- COMPONENTE LISTA PACIENTES ----------
  function ListaPacientes() {
    useEffect(() => {
      cargarPacientes();
    }, []);

    return (
      <>
        <h2>Pacientes</h2>

        {pacientes.length === 0 && (
          <p>No hay pacientes cargados.</p>
        )}

        <ul>
          {pacientes.map(p => (
            <li key={p.id}>
              <strong>{p.apellido}, {p.nombre}</strong><br />
              DNI: {p.dni}<br />
              Edad: {p.edad} años · Altura: {p.altura} m · Peso: {p.peso} kg
            </li>
          ))}
        </ul>
      </>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="app-container">
      <h1>Nutri App</h1>

      <div className="nav-buttons">
        <button onClick={() => setVista("inicio")}>Inicio</button>
        <button onClick={() => setVista("pacientes")}>Pacientes</button>
        <button onClick={() => setVista("nuevo")}>Nuevo paciente</button>
      </div>

      <hr />

      {vista === "inicio" && (
        <>
          <h2>Inicio</h2>
          <p>Estado del sistema:</p>
          <span className={
            estadoBackend === "Nutri App OK" ? "status-ok" : "status-off"
          }>
            {estadoBackend}
          </span>
        </>
      )}

      {vista === "pacientes" && <ListaPacientes />}
      {vista === "nuevo" && <NuevoPaciente />}
    </div>
  );
}
