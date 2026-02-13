import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NuevoPaciente from "./pages/NuevoPaciente";
import PacienteDetalle from "./pages/PacienteDetalle";
import PacienteEvolucion from "./pages/PacienteEvolucion";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo" element={<NuevoPaciente />} />
        <Route path="/paciente/:id" element={<PacienteDetalle />} />
        <Route path="/paciente/:id/evolucion" element={<PacienteEvolucion />} />
      </Routes>
    </BrowserRouter>
  );
}
