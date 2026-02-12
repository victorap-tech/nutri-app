import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PacienteDetalle from "./pages/PacienteDetalle";
import NuevoPaciente from "./pages/NuevoPaciente";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Crear paciente */}
        <Route path="/nuevo" element={<NuevoPaciente />} />

        {/* Detalle paciente */}
        <Route path="/paciente/:id" element={<PacienteDetalle />} />

        {/* Ruta fallback */}
        <Route
          path="*"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h2>Página no encontrada</h2>
              <a href="/" style={{ color: "#2c7be5" }}>
                Volver al inicio
              </a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
