import { NavLink, useParams } from "react-router-dom";

export default function TabsPaciente() {
  const { id } = useParams();

  const tabClass = ({ isActive }) =>
    "tab-btn " + (isActive ? "active" : "");

  return (
    <div className="tabs">
      <NavLink className={tabClass} to={`/pacientes/${id}`}>Ficha</NavLink>
      <NavLink className={tabClass} to={`/pacientes/${id}/evolucion`}>Evolución</NavLink>
      <NavLink className={tabClass} to={`/pacientes/${id}/plan`}>Plan</NavLink>
      <NavLink className={tabClass} to={`/pacientes/${id}/laboratorio`}>Laboratorio</NavLink>
    </div>
  );
}
