import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [estadoBackend, setEstadoBackend] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);

  // ================= BACKEND STATUS =================
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => setEstadoBackend(d.status))
      .catch(() => setEstadoBackend("Backend OFF"));
  }, []);

  // ================= PACIENTES =================
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
        body: JSON.stringify({
          ...form,
          edad: Number(form.edad),
          altura: Number(String(form.altura).replace(",", ".")),
          peso: Number(String(form.peso).replace(",", "."))
        })
      });

      setVista("pacientes");
      cargarPacientes();
    };

    return (
      <>
        <h2>Nuevo paciente</h2>

        {[
          ["Nombre", "nombre"],
          ["Apellido", "apellido"],
          ["DNI", "dni"],
          ["Edad", "edad"],
          ["Altura (m)", "altura"],
          ["Peso (kg)", "peso"]
        ].map(([label, key]) => (
          <input
            key={key}
            placeholder={label}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
          />
        ))}

        <button className="primary" onClick={guardar}>
          Guardar paciente
        </button>
      </>
    );
  }

  // ================= LISTA =================
  function ListaPacientes() {
    useEffect(() => {
      cargarPacientes();
    }, []);

    return (
      <>
        <h2>Pacientes</h2>

        <ul className="lista">
          {pacientes.map(p => (
            <li
              key={p.id}
              onClick={() => {
                setPacienteActivo(p);
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

  // ================= FICHA =================
  function FichaPaciente() {
    const [form, setForm] = useState({
      nombre: pacienteActivo.nombre,
      apellido: pacienteActivo.apellido,
      dni: pacienteActivo.dni,
      edad: pacienteActivo.edad,
      altura: pacienteActivo.altura,
      peso: pacienteActivo.peso,
      diagnostico: pacienteActivo.diagnostico || ""
    });

    const alturaNum = parseFloat(String(form.altura).replace(",", "."));
    const pesoNum = parseFloat(String(form.peso).replace(",", "."));

    const imc =
      alturaNum && pesoNum
        ? (pesoNum / (alturaNum * alturaNum)).toFixed(1)
        : "--";

    let rango = "";
    if (imc !== "--") {
      if (imc < 18.5) rango = "Bajo peso";
      else if (imc < 25) rango = "Normal";
      else if (imc < 30) rango = "Sobrepeso";
      else rango = "Obesidad";
    }

    const guardarCambios = async () => {
      await fetch(`${API}/pacientes/${pacienteActivo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          altura: alturaNum,
          peso: pesoNum
        })
      });

      await fetch(`${API}/pacientes/${pacienteActivo.id}/diagnostico`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnostico: form.diagnostico })
      });

      alert("Ficha actualizada");
      setVista("pacientes");
      cargarPacientes();
    };

    return (
      <div className="ficha-layout">
        {/* IZQUIERDA */}
        <div className="ficha">
          <h2>Ficha del paciente</h2>

          {[
            ["Nombre", "nombre"],
            ["Apellido", "apellido"],
            ["DNI", "dni"],
            ["Edad", "edad"],
            ["Altura (m)", "altura"],
            ["Peso (kg)", "peso"]
          ].map(([label, key]) => (
            <div key={key}>
              <label>{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}

          <div className="diagnostico-box">
            <h3>Diagnóstico</h3>
            <textarea
              value={form.diagnostico}
              placeholder="Diagnóstico clínico del paciente…"
              onChange={e =>
                setForm({ ...form, diagnostico: e.target.value })
              }
            />
          </div>

          <button className="primary" onClick={guardarCambios}>
            Guardar cambios
          </button>

          <button className="volver" onClick={() => setVista("pacientes")}>
            ← Volver
          </button>
        </div>

        {/* DERECHA */}
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
        </div>
      </div>
    );
  }

  // ================= RENDER =================
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
