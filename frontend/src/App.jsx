import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Conectando...");
  const [pantalla, setPantalla] = useState("inicio");
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus("Error de conexión"));
  }, []);

  useEffect(() => {
    if (pantalla === "pacientes") {
      fetch(import.meta.env.VITE_API_URL + "/pacientes")
        .then(res => res.json())
        .then(data => setPacientes(data));
    }
  }, [pantalla]);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Nutri App</h1>

      {/* MENU */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPantalla("inicio")}>Inicio</button>
        <button onClick={() => setPantalla("pacientes")} style={{ marginLeft: 10 }}>
          Pacientes
        </button>
      </div>

      {/* PANTALLAS */}
      {pantalla === "inicio" && (
        <>
          <h2>Inicio</h2>
          <p>Estado backend:</p>
          <strong>{status}</strong>
        </>
      )}

      {pantalla === "pacientes" && (
        <>
          <h2>Pacientes</h2>

          {pacientes.length === 0 ? (
            <p>No hay pacientes cargados.</p>
          ) : (
            <ul>
              {pacientes.map(p => (
                <li key={p.id}>
                  {p.nombre} – {p.edad} años
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
