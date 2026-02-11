import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [pacientes, setPacientes] = useState([]);
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`${API}/pacientes`)
      .then(r => r.json())
      .then(setPacientes);
  }, []);

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    return (peso / (altura * altura)).toFixed(1);
  };

  const rangoIMC = imc => {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  };

  const guardarCambios = async () => {
    await fetch(`${API}/pacientes/${paciente.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paciente)
    });
    alert("Datos guardados");
  };

  return (
    <div className="app">
      <h1>Nutri App</h1>

      <div className="nav">
        <button onClick={() => setVista("pacientes")}>Pacientes</button>
      </div>

      {vista === "pacientes" && (
        <ul className="lista">
          {pacientes.map(p => (
            <li key={p.id} onClick={() => { setPaciente(p); setVista("ficha"); }}>
              {p.apellido}, {p.nombre}
            </li>
          ))}
        </ul>
      )}

      {vista === "ficha" && paciente && (
        <div className="ficha-grid">

          {/* ---------- DATOS ---------- */}
          <div className="card">
            <h2>Ficha del paciente</h2>

            <label>Nombre</label>
            <input value={paciente.nombre}
              onChange={e => setPaciente({ ...paciente, nombre: e.target.value })} />

            <label>Apellido</label>
            <input value={paciente.apellido}
              onChange={e => setPaciente({ ...paciente, apellido: e.target.value })} />

            <label>DNI</label>
            <input value={paciente.dni}
              onChange={e => setPaciente({ ...paciente, dni: e.target.value })} />

            <label>Altura (m)</label>
            <input type="number" step="0.01" value={paciente.altura || ""}
              onChange={e => setPaciente({ ...paciente, altura: parseFloat(e.target.value) })} />

            <label>Peso (kg)</label>
            <input type="number" value={paciente.peso || ""}
              onChange={e => setPaciente({ ...paciente, peso: parseFloat(e.target.value) })} />

            <label>Cintura (cm)</label>
            <input type="number" value={paciente.cintura || ""}
              onChange={e => setPaciente({ ...paciente, cintura: parseFloat(e.target.value) })} />

            <label>Fecha visita</label>
            <input type="date" value={paciente.fecha_visita || ""}
              onChange={e => setPaciente({ ...paciente, fecha_visita: e.target.value })} />

            <label>Diagnóstico</label>
            <textarea
              className="diagnostico"
              value={paciente.diagnostico || ""}
              onChange={e => setPaciente({ ...paciente, diagnostico: e.target.value })}
            />

            <button className="guardar" onClick={guardarCambios}>
              Guardar cambios
            </button>

            <button className="volver" onClick={() => setVista("pacientes")}>
              ← Volver
            </button>
          </div>

          {/* ---------- IMC ---------- */}
          <div className="card">
            <h2>IMC</h2>

            {(() => {
              const imc = calcularIMC(paciente.peso, paciente.altura);
              if (!imc) return <p>Complete peso y altura</p>;

              return (
                <>
                  <div className="imc-num">{imc}</div>
                  <div className="imc-rango">{rangoIMC(imc)}</div>

                  <div className="barra-imc">
                    <div className="bajo" />
                    <div className="normal" />
                    <div className="sobre" />
                    <div className="obeso" />
                    <div
                      className="indicador"
                      style={{ left: `${Math.min(imc * 3, 100)}%` }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
