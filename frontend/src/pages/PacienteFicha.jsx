import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IMCBar from "../components/IMCBar";

const API = import.meta.env.VITE_API_URL;

function Dato({ label, value, unit }) {
  return (
    <div style={{
      background: "var(--surface-2)",
      borderRadius: "10px",
      padding: "14px 16px",
      border: "1px solid var(--border-light)",
    }}>
      <div style={{
        fontSize: "0.68rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "var(--text-muted)",
        marginBottom: "4px",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-display, Georgia, serif)",
        fontSize: "1.4rem",
        fontWeight: 300,
        color: "var(--text)",
        lineHeight: 1.1,
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "4px" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PacienteFicha() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`${API}/pacientes/${id}`)
      .then(res => res.json())
      .then(data => setPaciente(data));
  }, [id]);

  if (!paciente) return (
    <div className="empty-state">
      <div className="empty-state-icon">⏳</div>
      <p>Cargando ficha...</p>
    </div>
  );

  return (
    <div>
      {/* Grid de datos */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
        marginBottom: "8px",
      }}>
        <Dato label="DNI"     value={paciente.dni} />
        <Dato label="Edad"    value={paciente.edad}   unit="años" />
        <Dato label="Peso"    value={paciente.peso}   unit="kg" />
        <Dato label="Altura"  value={paciente.altura} unit="m" />
        <Dato label="Cintura" value={paciente.cintura} unit="cm" />
      </div>

      {/* IMC */}
      <IMCBar imc={paciente.imc} rango={paciente.rango_imc} />

      {/* Diagnóstico */}
      {paciente.diagnostico && (
        <div className="card" style={{ marginTop: "16px" }}>
          <div style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: "8px",
          }}>
            Diagnóstico
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)", margin: 0 }}>
            {paciente.diagnostico}
          </p>
        </div>
      )}
    </div>
  );
}
