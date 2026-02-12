import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import PacienteDetalle from "./pages/PacienteDetalle";
import PacienteEvolucion from "./pages/PacienteEvolucion";

function App() {
  return (
    <Router>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* NUEVO PACIENTE */}
        <Route path="/paciente/nuevo" element={<PacienteDetalle nuevo />} />

        {/* FICHA PACIENTE */}
        <Route path="/paciente/:id" element={<PacienteDetalle />} />

        {/* EVOLUCIÓN */}
        <Route path="/paciente/:id/evolucion" element={<PacienteEvolucion />} />

      </Routes>
    </Router>
  );
}

export default App;
