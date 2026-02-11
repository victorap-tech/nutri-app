import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActual, setPacienteActual] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

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

    alert("Paciente actualizado");
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

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const calcularIMC = () => {
    if (!pacienteActual?.peso || !pacienteActual?.altura) return null;
    return (
      pacienteActual.peso /
      (pacienteActual.altura * pacienteActual.altura)
    ).toFixed(2);
  };

  const obtenerRangoIMC = (imc) => {
    if (!imc) return { label: "", color: "#ccc", width: 0 };

    if (imc < 18.5) return { label: "Bajo peso", color: "#3498db", width: 25 };
    if (imc < 25) return { label: "Normal", color: "#2ecc71", width: 50 };
    if (imc < 30) return { label: "Sobrepeso", color: "#f39c12", width: 75 };
    return { label: "Obesidad", color: "#e74c3c", width: 100 };
  };

  const imc = calcularIMC();
  const rango = obtenerRangoIMC(imc);

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {/* BUSCADOR */}
      {!pacienteActual && !mostrarNuevo && (
        <div className="buscador-container">
          <button onClick={() => setMostrarNuevo(true)} className="btn">
            + Nuevo paciente
          </button>

          <input
            type="text"
            placeholder="Buscar paciente por nombre o DNI..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarDropdown(true);
            }}
            onFocus={() => setMostrarDropdown(true)}
            className="input-busqueda"
          />

          {mostrarDropdown && busqueda && (
            <div className="dropdown">
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((p) => (
                  <div
                    key={p.id}
                    className="dropdown-item"
                    onClick={() => {
                      seleccionarPaciente(p);
                      setBusqueda("");
                      setMostrarDropdown(false);
                    }}
                  >
                    {p.nombre} {p.apellido} — DNI {p.dni}
                  </div>
                ))
              ) : (
                <div className="dropdown-item vacío">
                  No encontrado
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* NUEVO PACIENTE */}
      {mostrarNuevo && (
        <div className="card form-card">
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
        <div className="perfil-layout">

          {/* FICHA EDITABLE */}
          <div className="card perfil">
            <h2>Ficha del paciente</h2>

            {Object.keys(pacienteActual).map((campo) => {
              if (campo === "id") return null;

              return (
                <input
                  key={campo}
                  value={pacienteActual[campo] || ""}
                  onChange={(e) =>
                    setPacienteActual({
                      ...pacienteActual,
                      [campo]: e.target.value
                    })
                  }
                />
              );
            })}

            {imc && (
              <>
                <h3>IMC: {imc}</h3>
                <div className="imc-bar">
                  <div
                    className="imc-fill"
                    style={{
                      width: `${rango.width}%`,
                      background: rango.color
                    }}
                  ></div>
                </div>
                <p style={{ color: rango.color }}>{rango.label}</p>
              </>
            )}

            <button className="btn" onClick={actualizarPaciente}>
              Guardar cambios
            </button>

            <button onClick={() => setPacienteActual(null)}>
              ← Volver
            </button>
          </div>

          {/* HISTORIAL */}
          <div className="card historial">
            <h2>Historial</h2>

            {visitas.map((v) => (
              <div key={v.id} className="visita-card">
                <h4>{v.fecha}</h4>
                <p>Peso: {v.peso} kg</p>
                <p>Cintura: {v.cintura} cm</p>
              </div>
            ))}

            <h3>Nueva visita</h3>

            {Object.keys(formVisita).map((campo) => (
              <input
                key={campo}
                type={campo === "fecha" ? "date" : "text"}
                placeholder={campo}
                value={formVisita[campo]}
                onChange={(e) =>
                  setFormVisita({
                    ...formVisita,
                    [campo]: e.target.value
                  })
                }
              />
            ))}

            <button className="btn" onClick={crearVisita}>
              Guardar visita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
