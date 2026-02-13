import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NuevoPaciente from "./pages/NuevoPaciente";
import PacienteDetalle from "./pages/PacienteDetalle";
import PacienteEvolucion from "./pages/PacienteEvolucion";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Nuevo paciente */}
        <Route path="/nuevo" element={<NuevoPaciente />} />

        {/* Detalle paciente */}
        <Route path="/paciente/:id" element={<PacienteDetalle />} />

        {/* Evolución paciente */}
        <Route
          path="/paciente/:id/evolucion"
          element={<PacienteEvolucion />}
        />
      </Routes>
    </Router>
  );
}

export default App;
