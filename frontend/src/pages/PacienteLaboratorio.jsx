import { useNavigate } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";

export default function PacienteLaboratorio() {
  const nav = useNavigate();

  return (
    <div className="container">
      <div className="row-between">
        <h1>Laboratorio (básico)</h1>
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
      </div>

      <TabsPaciente />

      <div className="card">
        <h3>Registro</h3>
        <div className="alert info">
          Este módulo lo dejamos listo en UI, pero necesita endpoints del backend para:
          <b> crear / listar / editar / borrar</b> datos de laboratorio.
          <br />
          Si querés, te paso el modelo + endpoints (HbA1c, Glucemia, Colesterol, TG, etc.) en 1 bloque.
        </div>
      </div>
    </div>
  );
}
