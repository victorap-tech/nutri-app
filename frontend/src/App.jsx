import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("pacientes");
  const [pacientes, setPacientes] = useState([]);
  const [paciente, setPaciente] = useState(null);

  // ---------------- CARGAR PACIENTES ----------------
  const cargarPacientes = () => {
    fetch(`${API}/pacientes`)
      .then(res => res.json())
      .then(data => setPacientes(data));
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  // ---------------- IMC ----------------
  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    return (peso / (altura * altura)).toFixed(1);
  };

  const rangoIMC = (imc) => {
    if (!imc) return "";
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  };

  // ---------------- NUEVO PACIENTE ----------------
  function NuevoPaciente() {
    const [form, setForm] = useState({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: "",
      cintura: ""
    });

    const guardar = () => {
      fetch(`${API}/pacientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      }).then(() => {
        alert("Paciente creado");
        setVista("pacientes");
        cargarPacientes();
      });
    };

    return (
      <div className="card">
        <h2>Nuevo paciente</h2>

        <label>Nombre</label>
        <input onChange={e => setForm({ ...form, nombre: e.target.value })} />

        <label>Apellido</label>
        <input onChange={e => setForm({ ...form, apellido: e.target.value })} />

        <label>DNI</label>
        <input onChange={e => setForm({ ...form, dni: e.target.value })} />

        <label>Edad</label>
        <input type="number" onChange={e => setForm({ ...form, edad: e.target.value })} />

        <label>Altura (m)</label>
        <input type="number" step="0.01" onChange={e => setForm({ ...form, altura: e.target.value })} />

        <label>Peso (kg)</label>
        <input type="number" step="0.1" onChange={e => setForm({ ...form, peso: e.target.value })} />

        <label>Cintura (cm)</label>
        <input type="number" onChange={e => setForm({ ...form, cintura: e.target.value })} />

        <button className="primary" onClick={guardar}>Guardar paciente</button>
        <button onClick={() => setVista("pacientes")}>← Cancelar</button>
      </div>
    );
  }

  // ---------------- LISTA ----------------
  function ListaPacientes() {
    return (
      <div className="card">
        <div className="header-flex">
          <h2>Pacientes</h2>
          <button className="primary" onClick={() => setVista("nuevo")}>
            + Nuevo paciente
          </button>
        </div>

        {pacientes.map(p => (
          <div
            key={p.id}
            className="paciente-item"
            onClick={() => {
              setPaciente(p);
              setVista("ficha");
            }}
          >
            {p.apellido}, {p.nombre}
          </div>
        ))}
      </div>
    );
  }

  // ---------------- FICHA ----------------
  function FichaPaciente() {
    const [form, setForm] = useState({
      ...paciente,
      fecha_visita: new Date().toISOString().slice(0, 10),
      cintura: paciente.cintura || ""
    });

    const imc = calcularIMC(form.peso, form.altura);

    const guardar = () => {
      fetch(`${API}/pacientes/${paciente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      }).then(() => {
        alert("Datos actualizados");
        cargarPacientes();
      });
    };

    return (
      <div className="ficha-layout">
        <div className="card ficha">
          <h2>Ficha del paciente</h2>

          <label>Nombre</label>
          <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />

          <label>Apellido</label>
          <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} />

          <label>Edad</label>
          <input type="number" value={form.edad || ""} onChange={e => setForm({ ...form, edad: e.target.value })} />

          <label>Altura (m)</label>
          <input type="number" step="0.01" value={form.altura || ""} onChange={e => setForm({ ...form, altura: e.target.value })} />

          <label>Peso (kg)</label>
          <input type="number" step="0.1" value={form.peso || ""} onChange={e => setForm({ ...form, peso: e.target.value })} />

          <label>Cintura (cm)</label>
          <input type="number" value={form.cintura} onChange={e => setForm({ ...form, cintura: e.target.value })} />

          <label>Fecha de visita</label>
          <input type="date" value={form.fecha_visita} onChange={e => setForm({ ...form, fecha_visita: e.target.value })} />

          <label>Diagnóstico</label>
          <textarea
            className="diagnostico"
            value={form.diagnostico || ""}
            onChange={e => setForm({ ...form, diagnostico: e.target.value })}
          />

          <button className="primary" onClick={guardar}>Guardar cambios</button>
          <button onClick={() => setVista("pacientes")}>← Volver</button>
        </div>

        {/* IMC */}
        <div className="card imc">
          <h3>IMC</h3>
          <div className="imc-num">{imc || "--"}</div>
          <div className="imc-rango">{rangoIMC(imc)}</div>

          <div className="imc-bar">
            <div className={`imc-marker imc-${rangoIMC(imc).toLowerCase().replace(" ", "")}`}></div>
          </div>

          <small>
            Bajo &lt;18.5 · Normal 18.5–24.9 · Sobrepeso 25–29.9 · Obesidad ≥30
          </small>
        </div>
      </div>
    );
  }

  // ---------------- RENDER ----------------
  return (
    <div className="app">
      <h1>Nutri App</h1>

      {vista === "pacientes" && <ListaPacientes />}
      {vista === "nuevo" && <NuevoPaciente />}
      {vista === "ficha" && paciente && <FichaPaciente />}
    </div>
  );
}
