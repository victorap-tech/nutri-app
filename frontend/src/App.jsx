import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Conectando...");

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus("Error de conexión"));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Nutri App</h1>
      <p>Estado backend:</p>
      <strong>{status}</strong>
    </div>
  );
}

export default App;
