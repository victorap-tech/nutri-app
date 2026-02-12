import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);

  const [editandoDiag, setEditandoDiag] = useState(false);
  const [diagTmp, setDiagTmp] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/pacientes`)
      .then((r) => r.json())
      .then((list) => {
        const p = list.find((x) => String(x.id) === String(id));
        setPaciente(p || null);
        setDiagTmp(p?.diagnostico || "");
      })
      .catch((e) => console.error("Error cargando paciente:", e));
  }, [id]);

  if (!paciente) return <div className="page">Cargando...</div>;

  const imc =
    paciente.peso && paciente.altura
      ? (paciente.peso / (paciente.altura ** 2)).toFixed(1)
      : "-";

  const guardarDiagnostico = async () => {
    try {
      setGuardando(true);

      const res = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paciente,
          diagnostico: diagTmp
        })
      });

      if (!res.ok) throw new Error("PUT falló");

      // refrescamos estado local
      setPaciente({ ...paciente, diagnostico: diagTmp });
      setEditandoDiag(false);
    } catch (e) {
      console.error("Error guardando diagnóstico:", e);
      alert("No se pudo guardar el diagnóstico");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <div className="card-form" style={{ maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>
            {paciente.nombre} {paciente.apellido}
          </h2>

          <button className="btn-secondary" onClick={() => navigate("/")}>
            ⬅ Volver
          </button>
        </div>

        <div style={{ height: 16 }} />

        <div className="grid-2">
          <div className="card-soft">
            <h3>Datos personales</h3>
            <p><b>DNI:</b> {paciente.dni || "-"}</p>
            <p><b>Edad:</b> {paciente.edad || "-"}</p>
            <p><b>Peso:</b> {paciente.peso ? `${paciente.peso} kg` : "-"}</p>
            <p><b>Altura:</b> {paciente.altura ? `${paciente.altura} m` : "-"}</p>
          </div>

          <div className="card-soft center">
            <h3>IMC</h3>
            <div className="imc">{imc}</div>
            <div className="badge">
              {imc === "-" ? "Sin datos" : Number(imc) < 18.5 ? "Bajo peso" : Number(imc) < 25 ? "Normal" : Number(imc) < 30 ? "Sobrepeso" : "Obesidad"}
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="card-soft">
          <h3>Diagnóstico</h3>

          {!editandoDiag ? (
            <>
              <p style={{ opacity: 0.85 }}>
                {paciente.diagnostico?.trim() ? paciente.diagnostico : "Sin diagnóstico cargado"}
              </p>

              <button className="btn-secondary" onClick={() => setEditandoDiag(true)}>
                Editar diagnóstico
              </button>
            </>
          ) : (
            <>
              <textarea
                className="textarea"
                value={diagTmp}
                onChange={(e) => setDiagTmp(e.target.value)}
                placeholder="Escribí el diagnóstico..."
              />

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setDiagTmp(paciente.diagnostico || ""); setEditandoDiag(false); }}>
                  Cancelar
                </button>
                <button className="btn-primary" disabled={guardando} onClick={guardarDiagnostico}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ height: 16 }} />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" onClick={() => navigate(`/paciente/${id}/evolucion`)}>
            Ver evolución →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PacienteDetalle;
