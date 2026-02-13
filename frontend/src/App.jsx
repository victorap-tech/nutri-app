import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

import Home from "./pages/Home";
import NuevoPaciente from "./pages/NuevoPaciente";
import PacienteDetalle from "./pages/PacienteDetalle";
import NuevaVisita from "./pages/NuevaVisita";
import PacienteEvolucion from "./pages/PacienteEvolucion";
import PacientePlan from "./pages/PacientePlan";
import PacienteLaboratorio from "./pages/PacienteLaboratorio";
import Alimentos from "./pages/Alimentos";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/pacientes/nuevo" element={<NuevoPaciente />} />
        <Route path="/pacientes/:id" element={<PacienteDetalle />} />

        <Route path="/pacientes/:id/visitas/nueva" element={<NuevaVisita />} />
        <Route path="/pacientes/:id/evolucion" element={<PacienteEvolucion />} />

        <Route path="/pacientes/:id/plan" element={<PacientePlan />} />
        <Route path="/pacientes/:id/laboratorio" element={<PacienteLaboratorio />} />

        <Route path="/alimentos" element={<Alimentos />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
