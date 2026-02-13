import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api/api";
import IMCBar from "../components/IMCBar";
import TabsPaciente from "../components/TabsPaciente";

export default function PacienteDetalle() {
  const { id } = useParams();
  const nav = useNavigate();

  const [p, setP] = useState(null);
  const [edit, setEdit] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function cargar() {
    setErr("");
    try {
      const data = await api.obtenerPaciente(id);
      setP(data);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => { cargar(); }, [id]);

  async function guardar() {
    setSaving(true);
    setErr("");
    try {
      const payload = {
        ...p,
        edad: p.edad ? Number(p.edad) : null,
        // altura NO se edita (solo inicial) ✅
        peso: p.peso ? Number(String(p.peso).replace(",", ".")) : null,
        cintura: p.cintura ? Number(String(p.cintura).replace(",", ".")) : null,
      };
      await api.actualizarPaciente(id, payload);
      setEdit(false);
      await cargar();
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (!p) {
    return (
      <div className="container">
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
        {err ? <div className="alert error">{err}</div> : <div className="muted">Cargando...</div>}
      </div>
    );
  }

  const nombre = p.apellido ? `${p.apellido}, ${p.nombre}` : p.nombre;

  return (
    <div className="container">
      <div className="row-between">
        <h1>{nombre}</h1>
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
      </div>

      <TabsPaciente />

      {err && <div className="alert error">{err}</div>}

      <div className="grid-2">
        <div className="card">
          <div className="row-between">
            <h3>Datos personales</h3>
            <div className="row">
              {!edit ? (
                <button className="btn" onClick={() => setEdit(true)}>Editar</button>
              ) : (
                <>
                  <button className="btn ghost" onClick={() => { setEdit(false); cargar(); }}>Cancelar</button>
                  <button className="btn primary" disabled={saving} onClick={guardar}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="form-grid">
            <label>DNI<input disabled={!edit} value={p.dni ?? ""} onChange={(e) => setP({ ...p, dni: e.target.value })} /></label>
            <label>Edad<input disabled={!edit} value={p.edad ?? ""} onChange={(e) => setP({ ...p, edad: e.target.value })} /></label>

            <label>Peso (kg)<input disabled={!edit} value={p.peso ?? ""} onChange={(e) => setP({ ...p, peso: e.target.value })} /></label>
            <label>Cintura (cm)<input disabled={!edit} value={p.cintura ?? ""} onChange={(e) => setP({ ...p, cintura: e.target.value })} /></label>

            <label>Altura (m) <span className="muted">(solo inicial)</span>
              <input disabled value={p.altura ?? ""} />
            </label>

            <label className="span-2">Diagnóstico
              <input disabled={!edit} value={p.diagnostico ?? ""} onChange={(e) => setP({ ...p, diagnostico: e.target.value })} />
            </label>
          </div>

          <div className="row gap">
            <Link className="btn" to={`/pacientes/${id}/visitas/nueva`}>+ Nueva visita</Link>
            <Link className="btn" to={`/pacientes/${id}/evolucion`}>Ver evolución</Link>
            <Link className="btn" to={`/pacientes/${id}/plan`}>Plan</Link>
            <Link className="btn" to={`/pacientes/${id}/laboratorio`}>Laboratorio</Link>
            <a className="btn primary" href={api.planPdfUrl(id)} target="_blank" rel="noreferrer">
              Exportar Plan PDF
            </a>
          </div>
        </div>

        <IMCBar peso={p.peso} altura={p.altura} />
      </div>
    </div>
  );
}
