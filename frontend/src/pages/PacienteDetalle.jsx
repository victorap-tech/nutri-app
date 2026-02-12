import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/pacientes/${id}`)
      .then(res => res.json())
      .then(data => setPaciente(data));
  }, [id]);

  if (!paciente) return <div>Cargando...</div>;

  const imc = (paciente.peso / (paciente.altura ** 2)).toFixed(1);

  return (
    <div className="container">
      <h1>Ficha del paciente</h1>

      <div className="card">
        <div className="grid-2">
          <div>
            <label>Nombre</label>
            <input value={paciente.nombre} readOnly />
          </div>
          <div>
            <label>Apellido</label>
            <input value={paciente.apellido} readOnly />
          </div>
          <div>
            <label>DNI</label>
            <input value={paciente.dni} readOnly />
          </div>
          <div>
            <label>Altura (m)</label>
            <input value={paciente.altura} readOnly />
          </div>
        </div>

        <div className="imc-box">
          <h2>IMC: {imc}</h2>
        </div>

        <div className="diagnostico-box">
          <label>Diagnóstico</label>
          <textarea value={paciente.diagnostico || ""} readOnly />
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate(`/paciente/${id}/evolucion`)}
        >
          Ver evolución →
        </button>
      </div>
    </div>
  );
}

export default PacienteDetalle;
