import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IMCBar from "../components/IMCBar";

const API = import.meta.env.VITE_API_URL;

export default function PacienteFicha() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}`)
      .then(res => res.json())
      .then(data => setPaciente(data));
  }, [id]);

  if (!paciente) return <p>Cargando...</p>;

  return (
    <div className="card">
      <h2>{paciente.nombre}, {paciente.apellido}</h2>

      <p>DNI: {paciente.dni}</p>
      <p>Edad: {paciente.edad}</p>
      <p>Peso: {paciente.peso} kg</p>
      <p>Altura: {paciente.altura} m</p>
      <p>Cintura: {paciente.cintura}</p>
      <p>Diagnóstico: {paciente.diagnostico}</p>

      <IMCBar imc={paciente.imc} rango={paciente.rango_imc} />
    </div>
  );
}
