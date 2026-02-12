import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NuevoPaciente() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const guardar = async (e) => {
    e.preventDefault();

    await fetch(`${API_URL}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/");
  };

  return (
    <div className="container">
      <h1>Nuevo Paciente</h1>

      <form onSubmit={guardar} className="form-grid">
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input name="dni" placeholder="DNI" onChange={handleChange} required />
        <input name="edad" placeholder="Edad" onChange={handleChange} />
        <input name="altura" placeholder="Altura (m)" onChange={handleChange} />
        <input name="peso" placeholder="Peso (kg)" onChange={handleChange} />
        <input name="cintura" placeholder="Cintura" onChange={handleChange} />
        <input type="date" name="fecha_visita" onChange={handleChange} />
        <textarea name="diagnostico" placeholder="Diagnóstico" onChange={handleChange} />

        <button type="submit" className="btn-principal">
          Guardar Paciente
        </button>
      </form>
    </div>
  );
}

export default NuevoPaciente;
