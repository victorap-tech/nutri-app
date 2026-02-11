import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [vista, setVista] = useState("pacientes");

  // ------------------ FETCH PACIENTES ------------------
  const cargarPacientes = async () => {
    const res = await fetch(`${API}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  // ------------------ SELECCIONAR PACIENTE ------------------
  const seleccionarPaciente = async (paciente) => {
    setPacienteActivo(paciente);
    setVista("ficha");

    const res = await fetch(`${API}/pacientes/${paciente.id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  // ------------------ IMC ------------------
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

  // ------------------ NUEVA VISITA ------------------
  const [visitaForm, setVisitaForm] = useState({
    fecha: "",
    peso: "",
    altura: "",
    cintura: "",
    diagnostico: ""
  });

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

  // ------------------ ACTUALIZAR PACIENTE ------------------
  const guardarPaciente = async () => {
    await fetch(`${API}/pacientes/${pacienteActivo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pacienteActivo)
    });

    cargarPacientes();
    alert("Paciente actualizado");
  };

  // ------------------ VISTAS ------------------
  if (vista === "pacientes") {
    return (
      <div className="app-container">
        <h1>Nutri App</h1>

        <button onClick={() => setVista("nuevo")} className="primary">
          + Nuevo paciente
        </button>

        <ul className="lista-pacientes">
          {pacientes.map(p => (
            <li key={p.id} onClick={() => seleccionarPaciente(p)}>
              {p.apellido}, {p.nombre}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (vista === "nuevo") {
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
      <div className="app-container">
        <h2>Nuevo paciente</h2>

        {Object.keys(form).map(k => (
          <input
            key={k}
            placeholder={k}
            onChange={e => setForm({ ...form, [k]: e.target.value })}
          />
        ))}

        <button onClick={guardar} className="primary">Guardar</button>
        <button onClick={() => setVista("pacientes")}>Volver</button>
      </div>
    );
  }

  // ------------------ FICHA ------------------
  const ultimaVisita = visitas[0];
  const imc = ultimaVisita
    ? calcularIMC(ultimaVisita.peso, ultimaVisita.altura)
    : null;

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

          <button onClick={guardarPaciente}>Guardar cambios</button>
        </div>

        {/* NUEVA VISITA */}
        <div className="card">
          <h3>Nueva visita</h3>

          <input type="date"
            value={visitaForm.fecha}
            onChange={e => setVisitaForm({ ...visitaForm, fecha: e.target.value })}
          />

          <input placeholder="Peso"
            value={visitaForm.peso}
            onChange={e => setVisitaForm({ ...visitaForm, peso: e.target.value })}
          />

          <input placeholder="Altura"
            value={visitaForm.altura}
            onChange={e => setVisitaForm({ ...visitaForm, altura: e.target.value })}
          />

          <input placeholder="Cintura"
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
              <div className="imc-numero">{imc}</div>
              <div className="imc-rango">{rangoIMC(imc)}</div>
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
