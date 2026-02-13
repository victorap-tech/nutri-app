import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Pacientes from "./pages/Pacientes";
import PacienteDetalle from "./pages/PacienteDetalle";
import NuevoPaciente from "./pages/NuevoPaciente";
import Alimentos from "./pages/Alimentos";

function App() {
  return (
    <Router>
      <div>

        {/* HEADER */}
        <div className="header">
          Nutri App – Solo Nutricionista
        </div>

        {/* NAV */}
        <div className="nav">
          <Link to="/">Pacientes</Link>
          <Link to="/alimentos">Alimentos</Link>
        </div>

        {/* CONTENIDO */}
        <div className="container">
          <Routes>
            <Route path="/" element={<Pacientes />} />
            <Route path="/pacientes/nuevo" element={<NuevoPaciente />} />
            <Route path="/pacientes/:id" element={<PacienteDetalle />} />
            <Route path="/alimentos" element={<Alimentos />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;
