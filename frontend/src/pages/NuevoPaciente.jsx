import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function NuevoPaciente() {
  const navigate = useNavigate();

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarPaciente = async () => {
    const res = await fetch(`${API_URL}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      navigate("/");
    }
  };

  return (
    <div className="page">
      <div className="card-form">
        <h2>Nuevo Paciente</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input name="apellido" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>DNI</label>
            <input name="dni" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input name="edad" type="number" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Altura (m)</label>
            <input name="altura" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Peso (kg)</label>
            <input name="peso" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Cintura (cm)</label>
            <input name="cintura" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Fecha de visita</label>
            <input name="fecha_visita" type="date" onChange={handleChange} />
          </div>

          <div className="form-group full">
            <label>Diagnóstico</label>
            <textarea name="diagnostico" onChange={handleChange} />
          </div>

        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={guardarPaciente}>
            Guardar Paciente
          </button>
        </div>
      </div>
    </div>
  );
}

export default NuevoPaciente;
