import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api/api";
import TabsPaciente from "../components/TabsPaciente";

export default function PacienteEvolucion() {
  const { id } = useParams();
  const nav = useNavigate();

  const [visitas, setVisitas] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const v = await api.listarVisitas(id);
        setVisitas(v);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [id]);

  return (
    <div className="container">
      <div className="row-between">
        <h1>Evolución</h1>
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
      </div>

      <TabsPaciente />

      {err && <div className="alert error">{err}</div>}

      <div className="row gap">
        <Link className="btn primary" to={`/pacientes/${id}/visitas/nueva`}>+ Nueva visita</Link>
      </div>

      <div className="card">
        <h3>Historial de visitas</h3>

        {visitas.length === 0 ? (
          <div className="muted">Todavía no hay visitas cargadas.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso</th>
                <th>Cintura</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {visitas.map((v) => (
                <tr key={v.id}>
                  <td>{v.fecha}</td>
                  <td>{v.peso ?? "—"}</td>
                  <td>{v.cintura ?? "—"}</td>
                  <td>{v.diagnostico ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
