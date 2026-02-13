import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function NuevoPaciente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    await api.crearPaciente(form);
    navigate("/");
  };

  return (
    <div className="container">
      <h1>Nuevo Paciente</h1>

      <div className="grid-form">
        <input name="nombre" placeholder="Nombre" onChange={handleChange} />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} />
        <input name="dni" placeholder="DNI" onChange={handleChange} />
        <input name="edad" placeholder="Edad" onChange={handleChange} />
        <input name="altura" placeholder="Altura (m)" onChange={handleChange} />
        <input name="peso" placeholder="Peso (kg)" onChange={handleChange} />
        <input name="cintura" placeholder="Cintura" onChange={handleChange} />
        <input name="diagnostico" placeholder="Diagnóstico" onChange={handleChange} />
      </div>

      <button className="btn-primary" onClick={guardar}>
        Guardar
      </button>
    </div>
  );
}
