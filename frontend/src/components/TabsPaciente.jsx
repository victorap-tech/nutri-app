import { NavLink, useParams } from "react-router-dom";

export default function TabsPaciente() {
  const { id } = useParams();

  return (
    <div className="tabs">
      <NavLink to={`/pacientes/${id}`} end>Ficha</NavLink>
      <NavLink to={`/pacientes/${id}/evolucion`}>Evolución</NavLink>
      <NavLink to={`/pacientes/${id}/plan`}>Plan</NavLink>
      <NavLink to={`/pacientes/${id}/laboratorio`}>Laboratorio</NavLink>
    </div>
  );
}
