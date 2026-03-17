import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function initials(nombre, apellido) {
  return `${(nombre || "?")[0]}${(apellido || "")[0] || ""}`.toUpperCase();
}

export default function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/pacientes`)
      .then(res => res.json())
      .then(data => { setPacientes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.dni}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <div className="page-title" style={{ marginBottom: 4 }}>Pacientes</div>
          <div className="page-subtitle">
            {loading ? "Cargando..." : `${pacientes.length} paciente${pacientes.length !== 1 ? "s" : ""} registrado${pacientes.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate("/nuevo")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo paciente
        </button>
      </div>

      <div className="top-bar" style={{ marginBottom: 20 }}>
        <input
          className="search-input"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {loading && (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Cargando pacientes...</p>
        </div>
      )}

      {!loading && filtrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>{busqueda ? "No se encontraron pacientes con ese criterio." : "No hay pacientes registrados aún."}</p>
        </div>
      )}

      {filtrados.map(p => (
        <div
          key={p.id}
          className="patient-card"
          onClick={() => navigate(`/pacientes/${p.id}`)}
        >
          <div className="patient-avatar">
            {initials(p.nombre, p.apellido)}
          </div>

          <div className="patient-card-body">
            <div className="patient-name">{p.apellido}, {p.nombre}</div>
            <div className="patient-info">
              DNI {p.dni}
              {p.edad ? ` · ${p.edad} años` : ""}
              {p.peso ? ` · ${p.peso} kg` : ""}
              {p.altura ? ` · ${p.altura} m` : ""}
            </div>
          </div>

          <span className="patient-card-arrow">›</span>
        </div>
      ))}
    </div>
  );
}
