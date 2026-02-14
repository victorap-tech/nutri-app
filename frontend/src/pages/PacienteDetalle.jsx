import { Outlet } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";

export default function PacienteDetalle() {
  return (
    <div className="container">
      <TabsPaciente />
      <Outlet />
    </div>
  );
}
