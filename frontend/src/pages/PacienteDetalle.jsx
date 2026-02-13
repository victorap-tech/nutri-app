import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    api.getPaciente(id).then(setPaciente);
  }, [id]);

  if (!paciente) return <div className="container">Cargando...</div>;

  const imc = paciente.peso && paciente.altura
    ? (paciente.peso / (paciente.altura * paciente.altura)).toFixed(1)
    : "-";

  return (
    <div className="container">
      <button onClick={() => navigate("/")} className="btn-secondary">
        ← Volver
      </button>

      <div className="grid">
        <div className="card">
          <h2>Datos personales</h2>
          <p><b>DNI:</b> {paciente.dni}</p>
          <p><b>Edad:</b> {paciente.edad}</p>
          <p><b>Peso:</b> {paciente.peso} kg</p>
          <p><b>Altura:</b> {paciente.altura} m</p>
        </div>

        <div className="card imc-box">
          <h2>IMC</h2>
          <div className="imc-number">{imc}</div>
        </div>
      </div>

      <div className="card">
        <h2>Diagnóstico</h2>
        <p>{paciente.diagnostico || "Sin diagnóstico cargado"}</p>
      </div>

      <button
        className="btn-primary"
        onClick={() => navigate(`/paciente/${id}/evolucion`)}
      >
        Ver evolución
      </button>
    </div>
  );
}
