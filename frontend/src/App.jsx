import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  // ---------------- ESTADOS GLOBALES ----------------
  const [vista, setVista] = useState("pacientes");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [visitas, setVisitas] = useState([]);

  // NUEVO PACIENTE (⬅️ FUERA de condicionales)
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: ""
  });

  // NUEVA VISITA
  const [visitaForm, setVisitaForm] = useState({
    fecha: "",
    peso: "",
    altura: "",
    cintura: "",
    diagnostico: ""
  });

  // ---------------- FETCH PACIENTES ----------------
  const cargarPacientes = async () => {
    const res = await fetch(`${API}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  // ---------------- SELECCIONAR PACIENTE ----------------
  const seleccionarPaciente = async (p) => {
    setPacienteActivo(p);
    setVista("ficha");

    const res = await fetch(`${API}/pacientes/${p.id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  // ---------------- IMC ----------------
  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    return (peso / (altura * altura)).toFixed(1);
  };

  const imcRango = (imc) => {
    if (!imc) return { label: "Sin datos", color: "#94a3b8" };
    if (imc < 18.5) return { label: "Bajo peso", color: "#38bdf8" };
    if (imc < 25) return { label: "Normal", color: "#22c55e" };
    if (imc < 30) return { label: "Sobrepeso", color: "#facc15" };
    return { label: "Obesidad", color: "#ef4444" };
  };

  // ---------------- GUARDAR PACIENTE ----------------
  const guardarPaciente = async () => {
    await fetch(`${API}/pacientes/${pacienteActivo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pacienteActivo)
    });

    await cargarPacientes();
    alert("Paciente actualizado");
  };

  // ---------------- GUARDAR NUEVO PACIENTE ----------------
  const guardarNuevoPaciente = async () => {
    await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPaciente)
    });

    setNuevoPaciente({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: ""
    });

    setVista("pacientes");
    cargarPacientes();
  };

  // ---------------- GUARDAR VISITA ----------------
  const guardarVisita = async () => {
    await fetch(`${API}/pacientes/${pacienteActivo.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitaForm)
    });

    setVisitaForm({
      fecha: "",
      peso: "",
      altura: "",
      cintura: "",
      diagnostico: ""
    });

    const res = await fetch(`${API}/pacientes/${pacienteActivo.id}/visitas`);
    setVisitas(await res.json());
  };

  // =========================
  // VISTA: LISTA PACIENTES
  // =========================
  if (vista === "pacientes") {
    return (
      <div className="app-container">
        <h1>Nutri App</h1>

        <button className="primary" onClick={() => setVista("nuevo")}>
          + Nuevo paciente
        </button>

        <ul className="lista-pacientes">
          {pacientes.map(p => (
            <li key={p.id} onClick={() => seleccionarPaciente(p)}>
              <strong>{p.apellido}, {p.nombre}</strong><br />
              DNI: {p.dni}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // =========================
  // VISTA: NUEVO PACIENTE
  // =========================
  if (vista === "nuevo") {
    return (
      <div className="app-container">
        <h2>Nuevo paciente</h2>

        {Object.keys(nuevoPaciente).map(campo => (
          <input
            key={campo}
            placeholder={campo}
            value={nuevoPaciente[campo]}
            onChange={e =>
              setNuevoPaciente({ ...nuevoPaciente, [campo]: e.target.value })
            }
          />
        ))}

        <button className="primary" onClick={guardarNuevoPaciente}>
          Guardar paciente
        </button>

        <button onClick={() => setVista("pacientes")}>
          Cancelar
        </button>
      </div>
    );
  }

  // =========================
  // VISTA: FICHA PACIENTE
  // =========================
  const ultima = visitas[0];
  const imc = ultima ? calcularIMC(ultima.peso, ultima.altura) : null;
  const rango = imcRango(imc);

  return (
    <div className="app-container">
      <button onClick={() => setVista("pacientes")}>← Volver</button>

      <h2>Ficha del paciente</h2>

      <div className="ficha-grid">

        {/* DATOS PACIENTE */}
        <div className="card">
          <h3>Datos personales</h3>

          {["nombre", "apellido", "dni", "edad"].map(campo => (
            <input
              key={campo}
              value={pacienteActivo[campo] || ""}
              onChange={e =>
                setPacienteActivo({ ...pacienteActivo, [campo]: e.target.value })
              }
              placeholder={campo}
            />
          ))}

          <button onClick={guardarPaciente}>
            Guardar cambios
          </button>
        </div>

        {/* NUEVA VISITA */}
        <div className="card">
          <h3>Nueva visita</h3>

          <input type="date"
            value={visitaForm.fecha}
            onChange={e => setVisitaForm({ ...visitaForm, fecha: e.target.value })}
          />

          <input placeholder="Peso (kg)"
            value={visitaForm.peso}
            onChange={e => setVisitaForm({ ...visitaForm, peso: e.target.value })}
          />

          <input placeholder="Altura (m)"
            value={visitaForm.altura}
            onChange={e => setVisitaForm({ ...visitaForm, altura: e.target.value })}
          />

          <input placeholder="Cintura (cm)"
            value={visitaForm.cintura}
            onChange={e => setVisitaForm({ ...visitaForm, cintura: e.target.value })}
          />

          <textarea
            placeholder="Diagnóstico"
            value={visitaForm.diagnostico}
            onChange={e => setVisitaForm({ ...visitaForm, diagnostico: e.target.value })}
          />

          <button className="primary" onClick={guardarVisita}>
            Guardar visita
          </button>
        </div>

        {/* IMC */}
        <div className="card imc">
          <h3>IMC</h3>

          {imc ? (
            <>
              <div className="imc-numero" style={{ color: rango.color }}>
                {imc}
              </div>
              <div className="imc-rango" style={{ color: rango.color }}>
                {rango.label}
              </div>
            </>
          ) : (
            <p>Sin datos</p>
          )}
        </div>

      </div>

      {/* HISTORIAL */}
      <h3>Historial de visitas</h3>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso</th>
            <th>Altura</th>
            <th>Cintura</th>
            <th>IMC</th>
          </tr>
        </thead>
        <tbody>
          {visitas.map(v => (
            <tr key={v.id}>
              <td>{v.fecha}</td>
              <td>{v.peso}</td>
              <td>{v.altura}</td>
              <td>{v.cintura}</td>
              <td>{calcularIMC(v.peso, v.altura)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
