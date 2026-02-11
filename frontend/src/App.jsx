import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [estadoBackend, setEstadoBackend] = useState("Chequeando...");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);

  // ================= BACKEND STATUS =================
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => setEstadoBackend(d.status))
      .catch(() => setEstadoBackend("Backend OFF"));
  }, []);

  // ================= FETCH PACIENTES =================
  const cargarPacientes = () => {
    fetch(`${API}/pacientes`)
      .then(r => r.json())
      .then(d => setPacientes(d));
  };

  // ================= NUEVO PACIENTE =================
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

      alert("Paciente creado");
      setVista("pacientes");
      cargarPacientes();
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

  // ================= LISTA PACIENTES =================
  function ListaPacientes() {
    useEffect(() => {
      cargarPacientes();
    }, []);

    return (
      <>
        <h2>Pacientes</h2>

        {pacientes.length === 0 && <p>No hay pacientes cargados</p>}

        <ul>
          {pacientes.map(p => (
            <li
              key={p.id}
              onClick={() => {
                setPacienteActivo(p);
                setVista("ficha");
              }}
            >
              <b>{p.apellido}, {p.nombre}</b><br />
              DNI: {p.dni}
            </li>
          ))}
        </ul>
      </>
    );
  }

  // ================= FICHA PACIENTE =================
  function FichaPaciente() {
    const [diagnostico, setDiagnostico] = useState(pacienteActivo?.diagnostico || "");

    const guardarDiagnostico = async () => {
      await fetch(`${API}/pacientes/${pacienteActivo.id}/diagnostico`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnostico })
      });

      alert("Diagnóstico guardado");
      cargarPacientes();
    };

    return (
      <>
        <h2>Ficha del paciente</h2>

        <div className="ficha">
          <p><b>Nombre:</b> {pacienteActivo.nombre}</p>
          <p><b>Apellido:</b> {pacienteActivo.apellido}</p>
          <p><b>DNI:</b> {pacienteActivo.dni}</p>
          <p><b>Edad:</b> {pacienteActivo.edad}</p>
          <p><b>Altura:</b> {pacienteActivo.altura} cm</p>
          <p><b>Peso:</b> {pacienteActivo.peso} kg</p>

          <h3>Diagnóstico</h3>
          <textarea
            rows="5"
            placeholder="Escriba el diagnóstico del paciente..."
            value={diagnostico}
            onChange={e => setDiagnostico(e.target.value)}
          />

          <button className="primary" onClick={guardarDiagnostico}>
            Guardar diagnóstico
          </button>
        </div>

        <button onClick={() => setVista("pacientes")}>
          ← Volver
        </button>
      </>
    );
  }

  // ================= RENDER =================
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
