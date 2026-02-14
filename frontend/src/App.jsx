import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import Home from "./pages/Home";
import NuevoPaciente from "./pages/NuevoPaciente";
import PacienteDetalle from "./pages/PacienteDetalle";
import PacienteFicha from "./pages/PacienteFicha";
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
        <Route path="/nuevo" element={<NuevoPaciente />} />
        <Route path="/alimentos" element={<Alimentos />} />

        <Route path="/pacientes/:id" element={<PacienteDetalle />}>
          <Route index element={<PacienteFicha />} />
          <Route path="evolucion" element={<PacienteEvolucion />} />
          <Route path="plan" element={<PacientePlan />} />
          <Route path="laboratorio" element={<PacienteLaboratorio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
