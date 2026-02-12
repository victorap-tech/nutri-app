import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function EvolucionPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/pacientes/${id}/visitas`)
      .then((r) => r.json())
      .then((data) => setVisitas(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error visitas:", e))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      <div className="card-form" style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Evolución</h2>
          <button className="btn-secondary" onClick={() => navigate(`/paciente/${id}`)}>
            ⬅ Volver
          </button>
        </div>

        <div style={{ height: 16 }} />

        {loading ? (
          <div>Cargando...</div>
        ) : visitas.length === 0 ? (
          <div className="card-soft">No hay visitas registradas.</div>
        ) : (
          <div className="card-soft">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Altura</th>
                  <th>Cintura</th>
                  <th>Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.peso ?? "-"}</td>
                    <td>{v.altura ?? "-"}</td>
                    <td>{v.cintura ?? "-"}</td>
                    <td>{v.diagnostico ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EvolucionPaciente;
