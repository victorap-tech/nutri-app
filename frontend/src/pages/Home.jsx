import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const navigate = useNavigate();

  const buscar = async (valor) => {
    setBusqueda(valor);

    if (!valor.trim()) {
      setResultados([]);
      return;
    }

    try {
      const res = await fetch(`${API}/pacientes/buscar?q=${valor}`);
      const data = await res.json();
      setResultados(data);
    } catch (err) {
      console.error("Error buscando paciente:", err);
    }
  };

  return (
    <div className="page-container">
      <h2>Pacientes</h2>

      <button
        className="btn-primary"
        onClick={() => navigate("/nuevo")}
      >
        + Nuevo paciente
      </button>

      <input
        type="text"
        placeholder="Buscar paciente..."
        value={busqueda}
        onChange={(e) => buscar(e.target.value)}
        className="input-search"
      />

      <div className="resultados">
        {resultados.length === 0 && busqueda && (
          <p className="sin-resultados">Sin resultados</p>
        )}

        {resultados.map((p) => (
          <div
            key={p.id}
            className="card-paciente"
            onClick={() => navigate(`/pacientes/${p.id}`)}
          >
            <strong>{p.nombre} {p.apellido}</strong>
            <span>DNI: {p.dni}</span>
            <span>Edad: {p.edad}</span>
            <span>Peso: {p.peso} kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}
