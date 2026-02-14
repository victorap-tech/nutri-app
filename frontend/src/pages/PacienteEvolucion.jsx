import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PacienteEvolucion() {
  const { id } = useParams();
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}/visitas`)
      .then(res => res.json())
      .then(data => {
        setVisitas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const eliminarVisita = async (visitaId) => {
    await fetch(`${API}/visitas/${visitaId}`, {
      method: "DELETE"
    });

    setVisitas(visitas.filter(v => v.id !== visitaId));
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return "-";
    return (peso / (altura * altura)).toFixed(2);
  };

  if (loading) return <p>Cargando...</p>;

  if (visitas.length === 0)
    return <p>No hay visitas registradas.</p>;

  return (
    <div className="card">
      <h3>Evolución</h3>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso</th>
            <th>Altura</th>
            <th>Cintura</th>
            <th>IMC</th>
            <th>Diagnóstico</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {visitas.map(v => (
            <tr key={v.id}>
              <td>{v.fecha}</td>
              <td>{v.peso}</td>
              <td>{v.altura}</td>
              <td>{v.cintura}</td>
              <td>{calcularIMC(v.peso, v.altura)}</td>
              <td>{v.diagnostico}</td>
              <td>
                <button
                  className="btn-danger"
                  onClick={() => eliminarVisita(v.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
