import { useState } from "react";

function App() {
  const [screen, setScreen] = useState("home");

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Nutri App</h1>

      {/* MENU */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setScreen("home")}>Inicio</button>{" "}
        <button onClick={() => setScreen("pacientes")}>Pacientes</button>
      </div>

      {/* PANTALLAS */}
      {screen === "home" && <Home />}
      {screen === "pacientes" && <Pacientes />}
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Inicio</h2>
      <p>Backend conectado correctamente.</p>
    </div>
  );
}

function Pacientes() {
  return (
    <div>
      <h2>Pacientes</h2>
      <p>Acá vamos a listar pacientes.</p>
    </div>
  );
}

export default App;
