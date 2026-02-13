import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";

export default function NuevaVisita() {
  const { id } = useParams();
  const nav = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    peso: "",
    cintura: "",
    diagnostico: "",
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  useEffect(() => {
    (async () => {
      try {
        const p = await api.obtenerPaciente(id);
        setPaciente(p);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [id]);

  async function guardar() {
    setSaving(true);
    setErr("");
    try {
      // altura se toma del paciente, no se edita en visita ✅
      const payload = {
        fecha: form.fecha,
        peso: form.peso,
        altura: paciente?.altura ?? null,
        cintura: form.cintura,
        diagnostico: form.diagnostico,
      };
      await api.crearVisita(id, payload);
      nav(`/pacientes/${id}/evolucion`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="row-between">
        <h1>Nueva visita</h1>
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
      </div>

      {err && <div className="alert error">{err}</div>}

      <div className="card">
        <h3>Registro</h3>

        <div className="form-grid">
          <label>Fecha
            <input type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </label>

          <label>Peso (kg)
            <input value={form.peso} onChange={(e) => set("peso", e.target.value)} />
          </label>

          <label>Cintura (cm)
            <input value={form.cintura} onChange={(e) => set("cintura", e.target.value)} />
          </label>

          <label>Altura (m) <span className="muted">(desde ficha)</span>
            <input disabled value={paciente?.altura ?? ""} />
          </label>

          <label className="span-2">Notas / Diagnóstico (de la visita)
            <input value={form.diagnostico} onChange={(e) => set("diagnostico", e.target.value)} />
          </label>
        </div>

        <div className="row-end">
          <button className="btn primary" onClick={guardar} disabled={saving}>
            {saving ? "Guardando..." : "Guardar visita"}
          </button>
        </div>
      </div>
    </div>
  );
}
