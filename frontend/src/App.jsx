import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PacienteDetalle from "./pages/PacienteDetalle";
import PacienteEvolucion from "./pages/PacienteEvolucion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paciente/:id" element={<PacienteDetalle />} />
        <Route path="/paciente/:id/evolucion" element={<PacienteEvolucion />} />
      </Routes>
    </Router>
  );
}

export default App;
