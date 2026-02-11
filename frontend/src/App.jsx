import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  const [pacienteActual, setPacienteActual] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [visitas, setVisitas] = useState([]);

  const [formPaciente, setFormPaciente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: "",
    cintura: "",
    diagnostico: ""
  });

  const [formVisita, setFormVisita] = useState({
    fecha: "",
    peso: "",
    altura: "",
    cintura: ""
  });

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
    setModoEdicion(false);
    setMostrarNuevo(false);
    setBusqueda("");
    setMostrarLista(false);

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
      cintura: "",
      diagnostico: ""
    });

    setMostrarNuevo(false);
    cargarPacientes();
  };

  const actualizarPaciente = async () => {
    await fetch(`${API_URL}/pacientes/${pacienteActual.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pacienteActual)
    });
    setModoEdicion(false);
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

  // ---------- IMC ----------
  const calcularIMC = () => {
    if (!pacienteActual?.peso || !pacienteActual?.altura) return null;
    return (
      pacienteActual.peso /
      (pacienteActual.altura * pacienteActual.altura)
    ).toFixed(2);
  };

  const imc = calcularIMC();

  const obtenerColorIMC = () => {
    if (!imc) return "#ccc";
    if (imc < 18.5) return "#3498db";
    if (imc < 25) return "#2ecc71";
    if (imc < 30) return "#f39c12";
    return "#e74c3c";
  };

  const posicionIMC = imc ? Math.min((imc / 40) * 100, 100) : 0;

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dni.includes(busqueda)
  );

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {/* BUSCADOR */}
      {!pacienteActual && !mostrarNuevo && (
        <>
          <div className="buscador">
            <input
              placeholder="Buscar paciente por nombre o DNI..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setMostrarLista(true);
              }}
              onFocus={() => setMostrarLista(true)}
            />

            {mostrarLista && busqueda && (
              <div className="dropdown">
                {pacientesFiltrados.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => seleccionarPaciente(p)}
                  >
                    {p.nombre} {p.apellido} - {p.dni}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn" onClick={() => setMostrarNuevo(true)}>
            + Nuevo paciente
          </button>
        </>
      )}

      {/* NUEVO PACIENTE */}
      {mostrarNuevo && (
        <div className="card">
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
          <button className="btn" onClick={crearPaciente}>
            Guardar
          </button>
        </div>
      )}

      {/* PERFIL */}
      {pacienteActual && (
        <div className="layout">
          <div className="card perfil">
            <h2>Ficha del paciente</h2>

            {Object.keys(pacienteActual).map(
              (campo) =>
                campo !== "id" && (
                  <input
                    key={campo}
                    value={pacienteActual[campo] || ""}
                    disabled={!modoEdicion}
                    onChange={(e) =>
                      setPacienteActual({
                        ...pacienteActual,
                        [campo]: e.target.value
                      })
                    }
                  />
                )
            )}

            {imc && (
              <>
                <h3>IMC: {imc}</h3>
                <div className="imc-bar">
                  <div
                    className="imc-marker"
                    style={{
                      left: `${posicionIMC}%`,
                      background: obtenerColorIMC()
                    }}
                  ></div>
                </div>
              </>
            )}

            {!modoEdicion ? (
              <button onClick={() => setModoEdicion(true)}>
                Editar
              </button>
            ) : (
              <button className="btn" onClick={actualizarPaciente}>
                Guardar cambios
              </button>
            )}

            <button onClick={() => setPacienteActual(null)}>
              ← Volver
            </button>
          </div>

          {/* HISTORIAL */}
          <div className="card historial">
            <h2>Historial</h2>

            <div className="tabla-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Peso</th>
                    <th>Cintura</th>
                    <th>Altura</th>
                  </tr>
                </thead>
                <tbody>
                  {visitas.map((v) => (
                    <tr key={v.id}>
                      <td>{v.fecha}</td>
                      <td>{v.peso} kg</td>
                      <td>{v.cintura || "-"} cm</td>
                      <td>{v.altura} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Nueva visita</h3>

            <input
              type="date"
              value={formVisita.fecha}
              onChange={(e) =>
                setFormVisita({ ...formVisita, fecha: e.target.value })
              }
            />
            <input
              placeholder="Peso"
              value={formVisita.peso}
              onChange={(e) =>
                setFormVisita({ ...formVisita, peso: e.target.value })
              }
            />
            <input
              placeholder="Altura"
              value={formVisita.altura}
              onChange={(e) =>
                setFormVisita({ ...formVisita, altura: e.target.value })
              }
            />
            <input
              placeholder="Cintura"
              value={formVisita.cintura}
              onChange={(e) =>
                setFormVisita({ ...formVisita, cintura: e.target.value })
              }
            />

            <button className="btn" onClick={crearVisita}>
              Guardar visita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
