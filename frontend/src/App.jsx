import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NuevoPaciente from "./pages/NuevoPaciente";
import PacienteDetalle from "./pages/PacienteDetalle";
import EvolucionPaciente from "./pages/EvolucionPaciente";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo" element={<NuevoPaciente />} />
        <Route path="/paciente/:id" element={<PacienteDetalle />} />
        <Route path="/paciente/:id/evolucion" element={<EvolucionPaciente />} />
      </Routes>
    </Router>
  );
}

export default App;
