import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
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

  const obtenerColorIMC = (imc) => {
    if (!imc) return "#ccc";
    if (imc < 18.5) return "#3b82f6";
    if (imc < 25) return "#16a34a";
    if (imc < 30) return "#f59e0b";
    return "#dc2626";
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

  if (!pacienteSeleccionado) {
    return (
      <div className="container">
        <h1>Nutri App PRO</h1>
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

  const visitasConIMC = visitas.map((v) => ({
    ...v,
    imc: calcularIMC(v.peso, v.altura || pacienteSeleccionado.altura)
  }));

  const ultimaVisita = visitasConIMC[0];
  const colorIMC = obtenerColorIMC(ultimaVisita?.imc);

  return (
    <div className="container">
      <h1>Ficha del paciente</h1>

      <div className="grid">
        {/* FICHA */}
        <div className="card">
          <h2>
            {pacienteSeleccionado.apellido}, {pacienteSeleccionado.nombre}
          </h2>

          <p><strong>DNI:</strong> {pacienteSeleccionado.dni}</p>
          <p><strong>Edad:</strong> {pacienteSeleccionado.edad}</p>

          {ultimaVisita && (
            <>
              <p><strong>Peso actual:</strong> {ultimaVisita.peso} kg</p>
              <p><strong>Cintura:</strong> {ultimaVisita.cintura || "-"} cm</p>
              <p><strong>IMC:</strong> {ultimaVisita.imc}</p>

              <div className="barra-imc">
                <div
                  className="barra-progreso"
                  style={{
                    width: `${Math.min((ultimaVisita.imc / 40) * 100, 100)}%`,
                    backgroundColor: colorIMC
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* HISTORIAL + GRAFICOS */}
        <div className="card historial">
          <h2>Evolución</h2>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={visitasConIMC.reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={visitasConIMC}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="imc"
                stroke="#dc2626"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

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
