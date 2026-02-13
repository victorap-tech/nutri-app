import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function NuevoPaciente() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    edad: "",
    altura: "",
    peso: "",
    cintura: "",
    diagnostico: "",
    fecha_visita: new Date().toISOString().slice(0, 10),
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function guardar() {
    setErr("");
    setSaving(true);
    try {
      // Altura solo carga inicial ✅
      const payload = {
        ...form,
        edad: form.edad ? Number(form.edad) : null,
        altura: form.altura ? Number(String(form.altura).replace(",", ".")) : null,
        peso: form.peso ? Number(String(form.peso).replace(",", ".")) : null,
        cintura: form.cintura ? Number(String(form.cintura).replace(",", ".")) : null,
      };

      const r = await api.crearPaciente(payload);
      nav(`/pacientes/${r.id}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="row-between">
        <h1>Nuevo paciente</h1>
        <button className="btn" onClick={() => nav(-1)}>← Volver</button>
      </div>

      {err && <div className="alert error">{err}</div>}

      <div className="grid">
        <div className="card">
          <h3>Datos iniciales</h3>

          <div className="form-grid">
            <label>Nombre<input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} /></label>
            <label>Apellido<input value={form.apellido} onChange={(e) => set("apellido", e.target.value)} /></label>
            <label>DNI<input value={form.dni} onChange={(e) => set("dni", e.target.value)} /></label>
            <label>Edad<input value={form.edad} onChange={(e) => set("edad", e.target.value)} /></label>

            <label>Altura (m) <span className="muted">(solo carga inicial)</span>
              <input value={form.altura} onChange={(e) => set("altura", e.target.value)} />
            </label>

            <label>Peso (kg)
              <input value={form.peso} onChange={(e) => set("peso", e.target.value)} />
            </label>

            <label>Cintura (cm)
              <input value={form.cintura} onChange={(e) => set("cintura", e.target.value)} />
            </label>

            <label>Fecha (primera visita)
              <input type="date" value={form.fecha_visita} onChange={(e) => set("fecha_visita", e.target.value)} />
            </label>

            <label className="span-2">Diagnóstico (inicial)
              <input value={form.diagnostico} onChange={(e) => set("diagnostico", e.target.value)} />
            </label>
          </div>

          <div className="row-end">
            <button className="btn primary" onClick={guardar} disabled={saving}>
              {saving ? "Guardando..." : "Guardar paciente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
