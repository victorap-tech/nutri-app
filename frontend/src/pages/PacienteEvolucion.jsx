import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function PacienteEvolucion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/pacientes/${id}/visitas`)
      .then(res => res.json())
      .then(data => setVisitas(data));
  }, [id]);

  return (
    <div className="container">
      <h1>Evolución del paciente</h1>

      <div className="card">
        <h2>Gráfico de peso</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={visitas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="peso" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Historial</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Peso (kg)</th>
              <th>Cintura (cm)</th>
            </tr>
          </thead>
          <tbody>
            {visitas.map((v, i) => (
              <tr key={i}>
                <td>{v.fecha}</td>
                <td>{v.peso}</td>
                <td>{v.cintura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="btn-secondary"
        onClick={() => navigate(`/paciente/${id}`)}
      >
        ← Volver a ficha
      </button>
    </div>
  );
}

export default PacienteEvolucion;
