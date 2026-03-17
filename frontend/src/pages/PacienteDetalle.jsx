import { useEffect, useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";

const API = import.meta.env.VITE_API_URL;

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}`)
      .then(r => r.json())
      .then(data => setPaciente(data))
      .catch(() => {});
  }, [id]);

  return (
    <div className="container">
      {/* Botón volver */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Volver a pacientes
      </button>

      {/* Header del paciente */}
      {paciente && (
        <div className="patient-header" style={{ marginBottom: "24px" }}>
          <div className="patient-header-left">
            <div className="patient-avatar-lg">
              {(paciente.nombre?.[0] || "?").toUpperCase()}
              {(paciente.apellido?.[0] || "").toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400, lineHeight: 1.1 }}>
                {paciente.apellido}, {paciente.nombre}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "3px" }}>
                DNI {paciente.dni}
                {paciente.edad ? ` · ${paciente.edad} años` : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs — solo una vez aquí */}
      <TabsPaciente />

      {/* Contenido de la ruta hija */}
      <Outlet />
    </div>
  );
}
