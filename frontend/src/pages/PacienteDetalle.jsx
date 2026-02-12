import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/pacientes/${id}`)
      .then((res) => res.json())
      .then((data) => setPaciente(data))
      .catch((err) => console.error("Error cargando paciente:", err));
  }, [id]);

  if (!paciente) return <div className="loading">Cargando...</div>;

  const imc = (paciente.peso / (paciente.altura ** 2)).toFixed(1);

  const getIMCRango = () => {
    if (imc < 18.5) return { texto: "Bajo peso", clase: "imc-bajo" };
    if (imc < 25) return { texto: "Normal", clase: "imc-normal" };
    if (imc < 30) return { texto: "Sobrepeso", clase: "imc-sobrepeso" };
    return { texto: "Obesidad", clase: "imc-obesidad" };
  };

  const rango = getIMCRango();

  return (
    <div className="detalle-container">

      <div className="detalle-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>{paciente.nombre} {paciente.apellido}</h1>
      </div>

      <div className="card-grid">

        <div className="card">
          <h3>Datos personales</h3>
          <p><strong>DNI:</strong> {paciente.dni}</p>
          <p><strong>Edad:</strong> {paciente.edad}</p>
          <p><strong>Peso:</strong> {paciente.peso} kg</p>
          <p><strong>Altura:</strong> {paciente.altura} m</p>
        </div>

        <div className="card imc-card">
          <h3>IMC</h3>
          <div className="imc-valor">{imc}</div>
          <div className={`imc-badge ${rango.clase}`}>
            {rango.texto}
          </div>
        </div>

      </div>

      <div className="card diagnostico-card">
        <h3>Diagnóstico</h3>
        <p>{paciente.diagnostico || "Sin diagnóstico cargado"}</p>
        <button className="btn-secundario">
          Editar diagnóstico
        </button>
      </div>

      <div className="acciones">
        <button className="btn-principal">
          Ver evolución
        </button>
      </div>

    </div>
  );
}

export default PacienteDetalle;
