import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PacientePlan() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}/plan`)
      .then(res => res.json())
      .then(data => setPlan(data));
  }, [id]);

  if (!plan) return <p>No hay plan activo</p>;

  return (
    <div className="card">
      <h3>Plan actual</h3>
      {plan.alimentos.map(item => (
        <div key={item.item_id}>
          <p>{item.comida} - {item.nombre} ({item.cantidad})</p>
        </div>
      ))}
    </div>
  );
}
