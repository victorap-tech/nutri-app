import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home.jsx";
import NuevoPaciente from "./pages/NuevoPaciente.jsx";
import PacienteDetalle from "./pages/PacienteDetalle.jsx";
import NuevaVisita from "./pages/NuevaVisita.jsx";
import PacienteEvolucion from "./pages/PacienteEvolucion.jsx";
import PacienteLaboratorio from "./pages/PacienteLaboratorio.jsx";
import PacientePlan from "./pages/PacientePlan.jsx";
import Alimentos from "./pages/Alimentos.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">

        {/* HEADER */}
        <header className="header">
          <h1>Nutri App</h1>
          <span className="badge">Solo Nutricionista</span>

          <nav className="nav">
            <Link to="/">Pacientes</Link>
            <Link to="/alimentos">Alimentos</Link>
          </nav>
        </header>

        {/* CONTENIDO */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nuevo" element={<NuevoPaciente />} />
            <Route path="/pacientes/:id" element={<PacienteDetalle />} />
            <Route path="/pacientes/:id/nueva-visita" element={<NuevaVisita />} />
            <Route path="/pacientes/:id/evolucion" element={<PacienteEvolucion />} />
            <Route path="/pacientes/:id/laboratorio" element={<PacienteLaboratorio />} />
            <Route path="/pacientes/:id/plan" element={<PacientePlan />} />
            <Route path="/alimentos" element={<Alimentos />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
