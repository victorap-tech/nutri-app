import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PacienteDetalle from "./pages/PacienteDetalle";
import PacienteEvolucion from "./pages/PacienteEvolucion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/paciente/:id" element={<PacienteDetalle />} />
        <Route path="/paciente/:id/evolucion" element={<PacienteEvolucion />} />
      </Routes>
    </Router>
  );
}

export default App;
