import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [busqueda, setBusqueda] = useState("");

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
    cintura: ""
  });

  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const res = await fetch(`${API_URL}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  const seleccionarPaciente = async (p) => {
    setPacienteActual(p);
    setMostrarNuevo(false);

    const res = await fetch(`${API_URL}/pacientes/${p.id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  const crearPaciente = async () => {
    await fetch(`${API_URL}/pacientes`, {
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
    await fetch(`${API_URL}/pacientes/${pacienteActual.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formVisita)
    });

    setFormVisita({
      fecha: "",
      peso: "",
      altura: "",
      cintura: ""
    });

    seleccionarPaciente(pacienteActual);
  };

  const calcularIMC = () => {
    if (!pacienteActual?.peso || !pacienteActual?.altura) return null;
    const imc = pacienteActual.peso / (pacienteActual.altura ** 2);
    return imc.toFixed(2);
  };

  const obtenerColorIMC = (imc) => {
    if (!imc) return "#ccc";
    if (imc < 18.5) return "#3b82f6";
    if (imc < 25) return "#16a34a";
    if (imc < 30) return "#f59e0b";
    return "#dc2626";
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const imc = calcularIMC();

  return (
    <div className="container">

      <h1>Nutri App</h1>

      {/* BARRA SUPERIOR */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Buscar paciente por nombre o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setMostrarNuevo(true)}>
          + Nuevo paciente
        </button>
      </div>

      {/* LISTADO */}
      {!pacienteActual && !mostrarNuevo && (
        <div className="resultados">
          {pacientesFiltrados.map((p) => (
            <div
              key={p.id}
              className="resultado-item"
              onClick={() => seleccionarPaciente(p)}
            >
              {p.nombre} {p.apellido} — DNI {p.dni}
            </div>
          ))}
        </div>
      )}

      {/* NUEVO PACIENTE */}
      {mostrarNuevo && (
        <div className="card">
          <h2>Nuevo paciente</h2>

          <div className="grid-2">
            <div>
              <label>Nombre</label>
              <input value={formPaciente.nombre}
                onChange={(e)=>setFormPaciente({...formPaciente,nombre:e.target.value})}/>
            </div>

            <div>
              <label>Apellido</label>
              <input value={formPaciente.apellido}
                onChange={(e)=>setFormPaciente({...formPaciente,apellido:e.target.value})}/>
            </div>

            <div>
              <label>DNI</label>
              <input value={formPaciente.dni}
                onChange={(e)=>setFormPaciente({...formPaciente,dni:e.target.value})}/>
            </div>

            <div>
              <label>Edad</label>
              <input value={formPaciente.edad}
                onChange={(e)=>setFormPaciente({...formPaciente,edad:e.target.value})}/>
            </div>

            <div>
              <label>Altura (m)</label>
              <input value={formPaciente.altura}
                onChange={(e)=>setFormPaciente({...formPaciente,altura:e.target.value})}/>
            </div>

            <div>
              <label>Peso (kg)</label>
              <input value={formPaciente.peso}
                onChange={(e)=>setFormPaciente({...formPaciente,peso:e.target.value})}/>
            </div>

            <div>
              <label>Cintura (cm)</label>
              <input value={formPaciente.cintura}
                onChange={(e)=>setFormPaciente({...formPaciente,cintura:e.target.value})}/>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn-primary" onClick={crearPaciente}>
              Guardar
            </button>
            <button className="btn-secondary" onClick={()=>setMostrarNuevo(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* PERFIL PACIENTE */}
      {pacienteActual && (
        <>
          <div className="card">
            <h2>Ficha del paciente</h2>

            <div className="grid-2">
              <div>
                <label>Nombre</label>
                <input value={pacienteActual.nombre} readOnly />
              </div>
              <div>
                <label>Apellido</label>
                <input value={pacienteActual.apellido} readOnly />
              </div>
              <div>
                <label>DNI</label>
                <input value={pacienteActual.dni} readOnly />
              </div>
              <div>
                <label>Altura (m)</label>
                <input value={pacienteActual.altura} readOnly />
              </div>
            </div>

            {imc && (
              <div className="imc-box">
                IMC: {imc}
                <div
                  className="imc-bar"
                  style={{ background: obtenerColorIMC(imc) }}
                />
              </div>
            )}

            <button
              className="btn-secondary"
              onClick={() => setPacienteActual(null)}
            >
              ← Volver
            </button>
          </div>

          <div className="card">
            <h2>Historial</h2>

            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>Altura (m)</th>
                  <th>Cintura (cm)</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.peso}</td>
                    <td>{v.altura}</td>
                    <td>{v.cintura}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Nueva visita</h3>

            <div className="grid-4">
              <input type="date"
                value={formVisita.fecha}
                onChange={(e)=>setFormVisita({...formVisita,fecha:e.target.value})}/>
              <input placeholder="Peso"
                value={formVisita.peso}
                onChange={(e)=>setFormVisita({...formVisita,peso:e.target.value})}/>
              <input placeholder="Altura"
                value={formVisita.altura}
                onChange={(e)=>setFormVisita({...formVisita,altura:e.target.value})}/>
              <input placeholder="Cintura"
                value={formVisita.cintura}
                onChange={(e)=>setFormVisita({...formVisita,cintura:e.target.value})}/>
            </div>

            <button className="btn-primary" onClick={crearVisita}>
              Guardar visita
            </button>
          </div>
        </>
      )}

    </div>
  );
}
