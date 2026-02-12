import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/api/pacientes/${id}`)
      .then((res) => res.json())
      .then((data) => setPaciente(data))
      .catch((err) => console.error("Error cargando paciente:", err));
  }, [id]);

  if (!paciente) return <div>Cargando...</div>;

  const imc = (paciente.peso / (paciente.altura ** 2)).toFixed(1);

  return (
    <div className="container">
      <h1>
        {paciente.nombre} {paciente.apellido}
      </h1>

      <div className="card">
        <p><strong>DNI:</strong> {paciente.dni}</p>
        <p><strong>Edad:</strong> {paciente.edad}</p>
        <p><strong>Peso:</strong> {paciente.peso} kg</p>
        <p><strong>Altura:</strong> {paciente.altura} m</p>
        <p><strong>IMC:</strong> {imc}</p>
      </div>

      <div className="card">
        <h3>Diagnóstico</h3>
        <p>{paciente.diagnostico || "Sin diagnóstico cargado"}</p>
      </div>

      <button
        className="btn"
        onClick={() => navigate(`/paciente/${id}/evolucion`)}
      >
        Ver evolución
      </button>
    </div>
  );
}

export default PacienteDetalle;
