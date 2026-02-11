import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [estadoBackend, setEstadoBackend] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);

  // ---------- BACKEND STATUS ----------
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
      .then(data => setPacientes(data))
      .catch(() => setPacientes([]));
  };

  // recargar al entrar a la vista
  useEffect(() => {
    if (vista === "pacientes") {
      cargarPacientes();
    }
  }, [vista]);

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
        body: JSON.stringify({
          ...form,
          edad: Number(form.edad),
          altura: Number(form.altura),
          peso: Number(form.peso)
        })
      });

      alert("Paciente cargado correctamente");
      setVista("pacientes");
    };

    return (
      <>
        <h2>Nuevo paciente</h2>

        <input placeholder="Nombre" onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <input placeholder="Apellido" onChange={e => setForm({ ...form, apellido: e.target.value })} />
        <input placeholder="DNI" onChange={e => setForm({ ...form, dni: e.target.value })} />
        <input type="number" placeholder="Edad" onChange={e => setForm({ ...form, edad: e.target.value })} />
        <input type="number" placeholder="Altura (cm)" onChange={e => setForm({ ...form, altura: e.target.value })} />
        <input type="number" placeholder="Peso (kg)" onChange={e => setForm({ ...form, peso: e.target.value })} />

        <button className="primary" onClick={guardar}>Guardar paciente</button>
      </>
    );
  }

  // ---------- LISTA ----------
  function ListaPacientes() {
    return (
      <>
        <h2>Pacientes</h2>

        {pacientes.length === 0 && <p>No hay pacientes cargados.</p>}

        <ul className="lista-pacientes">
          {pacientes.map(p => (
            <li key={p.id} onClick={() => {
              setPacienteActivo(p);
              setVista("ficha");
            }}>
              <strong>{p.apellido}, {p.nombre}</strong><br />
              DNI: {p.dni}
            </li>
          ))}
        </ul>
      </>
    );
  }

  // ---------- FICHA ----------
  function FichaPaciente() {
    if (!pacienteActivo) return null;

    return (
      <>
        <h2>Ficha del paciente</h2>

        <div className="ficha">
          <p><b>Apellido:</b> {pacienteActivo.apellido}</p>
          <p><b>Nombre:</b> {pacienteActivo.nombre}</p>
          <p><b>DNI:</b> {pacienteActivo.dni}</p>
          <p><b>Edad:</b> {pacienteActivo.edad}</p>
          <p><b>Altura:</b> {pacienteActivo.altura} cm</p>
          <p><b>Peso:</b> {pacienteActivo.peso} kg</p>
        </div>

        <button onClick={() => setVista("pacientes")}>← Volver</button>
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
          <p>Estado del sistema:</p>
          <span className={estadoBackend === "Nutri App OK" ? "status-ok" : "status-off"}>
            {estadoBackend}
          </span>
        </>
      )}

      {vista === "pacientes" && <ListaPacientes />}
      {vista === "nuevo" && <NuevoPaciente />}
      {vista === "ficha" && <FichaPaciente />}
    </div>
  );
}
