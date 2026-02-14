import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

function PacienteDetalle() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [tab, setTab] = useState("ficha");

  useEffect(() => {
    fetch(`${API}/pacientes/${id}`)
      .then(res => res.json())
      .then(data => setPaciente(data));
  }, [id]);

  if (!paciente) return <p>Cargando...</p>;

  const imc = paciente.peso && paciente.altura
    ? (paciente.peso / (paciente.altura * paciente.altura)).toFixed(2)
    : null;

  const rangoImc = () => {
    if (!imc) return "";
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  };

  return (
    <div>
      <h2>{paciente.nombre}, {paciente.apellido}</h2>

      <div className="tabs">
        <button onClick={() => setTab("ficha")} className={tab === "ficha" ? "active" : ""}>Ficha</button>
        <button onClick={() => setTab("evolucion")} className={tab === "evolucion" ? "active" : ""}>Evolución</button>
        <button onClick={() => setTab("plan")} className={tab === "plan" ? "active" : ""}>Plan</button>
        <button onClick={() => setTab("laboratorio")} className={tab === "laboratorio" ? "active" : ""}>Laboratorio</button>
      </div>

      {tab === "ficha" && (
        <div className="card-section">
          <p><strong>DNI:</strong> {paciente.dni}</p>
          <p><strong>Edad:</strong> {paciente.edad}</p>
          <p><strong>Peso:</strong> {paciente.peso} kg</p>
          <p><strong>Altura:</strong> {paciente.altura} m</p>
          <p><strong>Cintura:</strong> {paciente.cintura} cm</p>

          <div className="card-imc">
            <h3>IMC</h3>
            <p>{imc}</p>
            <p>{rangoImc()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PacienteDetalle;
