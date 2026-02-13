import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

export default function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function cargar() {
    setErr("");
    setLoading(true);
    try {
      const data = q.trim()
        ? await api.buscarPacientes(q.trim())
        : await api.listarPacientes();
      setPacientes(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line
  }, []);

  const title = useMemo(() => (q.trim() ? "Resultados" : "Pacientes"), [q]);

  return (
    <div className="container">
      <div className="row-between">
        <h1>{title}</h1>

        <Link className="btn primary" to="/pacientes/nuevo">
          + Nuevo paciente
        </Link>
      </div>

      <div className="searchbar">
        <input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cargar()}
        />
        <button className="btn" onClick={cargar}>Buscar</button>
        <button className="btn ghost" onClick={() => { setQ(""); setTimeout(cargar, 0); }}>
          Limpiar
        </button>
      </div>

      {err && <div className="alert error">{err}</div>}
      {loading && <div className="muted">Cargando...</div>}

      <div className="list">
        {pacientes.map((p) => (
          <Link key={p.id} className="list-item" to={`/pacientes/${p.id}`}>
            <div className="list-title">
              {p.apellido ? `${p.apellido}, ${p.nombre}` : p.nombre}
            </div>
            <div className="list-sub">
              DNI: {p.dni ?? "—"} · Edad: {p.edad ?? "—"} · Peso: {p.peso ?? "—"}
            </div>
          </Link>
        ))}

        {!loading && pacientes.length === 0 && (
          <div className="muted">No hay pacientes.</div>
        )}
      </div>
    </div>
  );
}
