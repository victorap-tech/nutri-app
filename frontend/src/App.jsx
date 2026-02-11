import { useEffect, useState } from "react";
import "./App.css";

const API = "https://nutri-app-production-175c.up.railway.app";

function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

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
    cintura: "",
    diagnostico: ""
  });

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    const res = await fetch(`${API}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  const fetchVisitas = async (id) => {
    const res = await fetch(`${API}/pacientes/${id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  const seleccionarPaciente = (p) => {
    setPacienteSeleccionado(p);
    fetchVisitas(p.id);
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    return (peso / (altura * altura)).toFixed(2);
  };

  const obtenerRangoIMC = (imc) => {
    if (!imc) return "";
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  };

  const obtenerColorIMC = (imc) => {
    if (!imc) return "#ccc";
    if (imc < 18.5) return "#3b82f6";
    if (imc < 25) return "#16a34a";
    if (imc < 30) return "#f59e0b";
    return "#dc2626";
  };

  const guardarPaciente = async () => {
    await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPaciente)
    });

    setMostrarNuevo(false);
    setFormPaciente({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: "",
      cintura: ""
    });

    fetchPacientes();
  };

  const guardarVisita = async () => {
    await fetch(`${API}/pacientes/${pacienteSeleccionado.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formVisita)
    });

    setFormVisita({
      fecha: "",
      peso: "",
      altura: "",
      cintura: "",
      diagnostico: ""
    });

    fetchVisitas(pacienteSeleccionado.id);
  };

  if (mostrarNuevo) {
    return (
      <div className="container">
        <div className="card-form">
          <h2>Nuevo paciente</h2>
          {Object.keys(formPaciente).map((campo) => (
            <input
              key={campo}
              placeholder={campo}
              value={formPaciente[campo]}
              onChange={(e) =>
                setFormPaciente({
                  ...formPaciente,
                  [campo]: e.target.value
                })
              }
            />
          ))}
          <button className="btn-primary" onClick={guardarPaciente}>
            Guardar paciente
          </button>
          <button className="btn-secondary" onClick={() => setMostrarNuevo(false)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (!pacienteSeleccionado) {
    return (
      <div className="container">
        <h1>Nutri App</h1>
        <button className="btn-primary" onClick={() => setMostrarNuevo(true)}>
          + Nuevo paciente
        </button>

        <div className="lista">
          {pacientes.map((p) => (
            <div
              key={p.id}
              className="card-lista"
              onClick={() => seleccionarPaciente(p)}
            >
              {p.apellido}, {p.nombre}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ultimaVisita = visitas[0];
  const imc = calcularIMC(
    ultimaVisita?.peso,
    ultimaVisita?.altura || pacienteSeleccionado.altura
  );

  const colorIMC = obtenerColorIMC(imc);

  return (
    <div className="container">
      <h1>Nutri App</h1>

      <div className="grid">
        {/* FICHA */}
        <div className="card">
          <h2>
            {pacienteSeleccionado.apellido}, {pacienteSeleccionado.nombre}
          </h2>

          <p><strong>DNI:</strong> {pacienteSeleccionado.dni}</p>
          <p><strong>Edad:</strong> {pacienteSeleccionado.edad}</p>
          <p><strong>Altura:</strong> {pacienteSeleccionado.altura} m</p>
          <p><strong>Peso actual:</strong> {ultimaVisita?.peso || pacienteSeleccionado.peso} kg</p>
          <p><strong>Cintura actual:</strong> {ultimaVisita?.cintura || "-"} cm</p>

          {imc && (
            <>
              <p><strong>IMC:</strong> {imc}</p>

              <div className="barra-imc">
                <div
                  className="barra-progreso"
                  style={{
                    width: `${Math.min((imc / 40) * 100, 100)}%`,
                    backgroundColor: colorIMC
                  }}
                />
              </div>

              <p style={{ color: colorIMC }}>
                {obtenerRangoIMC(imc)}
              </p>
            </>
          )}

          <button className="btn-secondary" onClick={() => setPacienteSeleccionado(null)}>
            ← Volver
          </button>
        </div>

        {/* HISTORIAL */}
        <div className="card historial">
          <h2>Historial de visitas</h2>

          <div className="lista-visitas">
            {visitas.map((v) => (
              <div key={v.id} className="card-visita">
                <h4>{v.fecha}</h4>
                <p>Peso: {v.peso} kg</p>
                <p>Cintura: {v.cintura || "-"} cm</p>
                <p>{v.diagnostico}</p>
              </div>
            ))}
          </div>

          <div className="nueva-visita">
            <h3>Nueva visita</h3>

            <input
              type="date"
              value={formVisita.fecha}
              onChange={(e) =>
                setFormVisita({ ...formVisita, fecha: e.target.value })
              }
            />
            <input
              placeholder="peso"
              value={formVisita.peso}
              onChange={(e) =>
                setFormVisita({ ...formVisita, peso: e.target.value })
              }
            />
            <input
              placeholder="altura"
              value={formVisita.altura}
              onChange={(e) =>
                setFormVisita({ ...formVisita, altura: e.target.value })
              }
            />
            <input
              placeholder="cintura"
              value={formVisita.cintura}
              onChange={(e) =>
                setFormVisita({ ...formVisita, cintura: e.target.value })
              }
            />
            <textarea
              placeholder="diagnóstico"
              value={formVisita.diagnostico}
              onChange={(e) =>
                setFormVisita({
                  ...formVisita,
                  diagnostico: e.target.value
                })
              }
            />

            <button className="btn-primary" onClick={guardarVisita}>
              Guardar visita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
