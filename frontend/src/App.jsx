import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PacienteDetalle from "./pages/PacienteDetalle";
import Alimentos from "./pages/Alimentos";

function App() {
  return (
    <Router>
      <div className="layout">
        <header className="navbar">
          <h1>Nutri App</h1>
          <div className="subtitle">Solo Nutricionista</div>
          <nav>
            <a href="/">Pacientes</a>
            <a href="/alimentos">Alimentos</a>
          </nav>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pacientes/:id" element={<PacienteDetalle />} />
            <Route path="/alimentos" element={<Alimentos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
