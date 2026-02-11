import React, { useEffect, useState } from "react";
import "./App.css";

const API = "https://nutri-app-production-2d7c.up.railway.app";

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [vista, setVista] = useState("lista");
  const [pacienteActual, setPacienteActual] = useState(null);
  const [visitas, setVisitas] = useState([]);

  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: "",
    cintura: "",
    fecha_visita: "",
    diagnostico: ""
  });

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const res = await fetch(`${API}/pacientes`);
    const data = await res.json();
    setPacientes(data);
  };

  const guardarPaciente = async () => {
    await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPaciente)
    });

    setVista("lista");
    cargarPacientes();
  };

  const seleccionarPaciente = async (p) => {
    setPacienteActual(p);
    setVista("ficha");

    const res = await fetch(`${API}/pacientes/${p.id}/visitas`);
    const data = await res.json();
    setVisitas(data);
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    return (peso / (altura * altura)).toFixed(2);
  };

  const rangoIMC = (imc) => {
    if (!imc) return { texto: "", color: "" };

    if (imc < 18.5)
      return { texto: "Bajo peso", color: "blue" };
    if (imc < 25)
      return { texto: "Normal", color: "green" };
    if (imc < 30)
      return { texto: "Sobrepeso", color: "orange" };
    return { texto: "Obesidad", color: "red" };
  };

  return (
    <div className="container">
      <h1>Nutri App</h1>

      {vista === "lista" && (
        <>
          <button
            className="btn-primary"
            onClick={() => setVista("nuevo")}
          >
            + Nuevo Paciente
          </button>

          <div className="lista-pacientes">
            {pacientes.map((p) => (
              <div
                key={p.id}
                className="card-paciente"
                onClick={() => seleccionarPaciente(p)}
              >
                {p.apellido}, {p.nombre}
              </div>
            ))}
          </div>
        </>
      )}

      {vista === "nuevo" && (
        <div className="card">
          <h2>Nuevo paciente</h2>

          <div className="form-vertical">
            <input placeholder="Nombre"
              value={nuevoPaciente.nombre}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })
              }
            />

            <input placeholder="Apellido"
              value={nuevoPaciente.apellido}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, apellido: e.target.value })
              }
            />

            <input placeholder="DNI"
              value={nuevoPaciente.dni}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })
              }
            />

            <input type="number" placeholder="Edad"
              value={nuevoPaciente.edad}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, edad: e.target.value })
              }
            />

            <input type="number" step="0.01" placeholder="Altura (m)"
              value={nuevoPaciente.altura}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, altura: e.target.value })
              }
            />

            <input type="number" step="0.1" placeholder="Peso inicial (kg)"
              value={nuevoPaciente.peso}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, peso: e.target.value })
              }
            />

            <input type="number" step="0.1" placeholder="Cintura inicial (cm)"
              value={nuevoPaciente.cintura}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, cintura: e.target.value })
              }
            />

            <input type="date"
              value={nuevoPaciente.fecha_visita}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, fecha_visita: e.target.value })
              }
            />

            <textarea
              placeholder="Diagnóstico inicial"
              value={nuevoPaciente.diagnostico}
              onChange={(e) =>
                setNuevoPaciente({ ...nuevoPaciente, diagnostico: e.target.value })
              }
            />

            {calcularIMC(nuevoPaciente.peso, nuevoPaciente.altura) && (
              <div className="imc-box">
                <div>
                  IMC: {calcularIMC(nuevoPaciente.peso, nuevoPaciente.altura)}
                </div>

                <div
                  className={`imc-bar ${
                    rangoIMC(
                      calcularIMC(nuevoPaciente.peso, nuevoPaciente.altura)
                    ).color
                  }`}
                />

                <div className="imc-text">
                  {
                    rangoIMC(
                      calcularIMC(nuevoPaciente.peso, nuevoPaciente.altura)
                    ).texto
                  }
                </div>
              </div>
            )}

            <div className="acciones">
              <button className="btn-primary" onClick={guardarPaciente}>
                Guardar paciente
              </button>
              <button onClick={() => setVista("lista")}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {vista === "ficha" && pacienteActual && (
        <div className="layout-ficha">
          <div className="card">
            <h2>
              {pacienteActual.apellido}, {pacienteActual.nombre}
            </h2>

            <p>DNI: {pacienteActual.dni}</p>
            <p>Edad: {pacienteActual.edad}</p>
            <p>Altura: {pacienteActual.altura} m</p>
            <p>Peso: {pacienteActual.peso} kg</p>
            <p>Cintura: {pacienteActual.cintura} cm</p>

            {calcularIMC(pacienteActual.peso, pacienteActual.altura) && (
              <div className="imc-box">
                <div>
                  IMC: {calcularIMC(
                    pacienteActual.peso,
                    pacienteActual.altura
                  )}
                </div>

                <div
                  className={`imc-bar ${
                    rangoIMC(
                      calcularIMC(
                        pacienteActual.peso,
                        pacienteActual.altura
                      )
                    ).color
                  }`}
                />

                <div className="imc-text">
                  {
                    rangoIMC(
                      calcularIMC(
                        pacienteActual.peso,
                        pacienteActual.altura
                      )
                    ).texto
                  }
                </div>
              </div>
            )}

            <button onClick={() => setVista("lista")}>
              ← Volver
            </button>
          </div>

          <div className="card">
            <h3>Historial de visitas</h3>
            {visitas.map((v) => (
              <div key={v.id} className="visita">
                <strong>{v.fecha}</strong>
                <div>Peso: {v.peso} kg</div>
                <div>Cintura: {v.cintura} cm</div>
                <div>Diagnóstico: {v.diagnostico}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
