import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabsPaciente from "../components/TabsPaciente";
import { apiFetch } from "../api";

export default function PacienteLaboratorio() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    glucosa: "",
    colesterol_total: "",
    hdl: "",
    ldl: "",
    trigliceridos: "",
    tsh: "",
    observaciones: "",
  });

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/pacientes/${id}/laboratorio`);
      setLabs(data);
    } catch (e) {
      setError(`Error cargando laboratorio: ${e.message}`);
      setLabs([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line
  }, [id]);

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function crear() {
    setError("");
    try {
      await apiFetch(`/pacientes/${id}/laboratorio`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      await cargar();
      setForm((prev) => ({ ...prev, observaciones: "" }));
    } catch (e) {
      setError(`No se pudo guardar: ${e.message}`);
    }
  }

  async function eliminar(labId) {
    setError("");
    try {
      await apiFetch(`/laboratorio/${labId}`, { method: "DELETE" });
      await cargar();
    } catch (e) {
      setError(`No se pudo eliminar: ${e.message}`);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <TabsPaciente />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <TabsPaciente />
      <h2>Laboratorio</h2>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="card">
        <h3>Nuevo registro</h3>

        <div className="grid">
          <div>
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setField("fecha", e.target.value)} />
          </div>

          <div>
            <label>Glucosa</label>
            <input value={form.glucosa} onChange={(e) => setField("glucosa", e.target.value)} />
          </div>

          <div>
            <label>Colesterol total</label>
            <input value={form.colesterol_total} onChange={(e) => setField("colesterol_total", e.target.value)} />
          </div>

          <div>
            <label>HDL</label>
            <input value={form.hdl} onChange={(e) => setField("hdl", e.target.value)} />
          </div>

          <div>
            <label>LDL</label>
            <input value={form.ldl} onChange={(e) => setField("ldl", e.target.value)} />
          </div>

          <div>
            <label>Triglicéridos</label>
            <input value={form.trigliceridos} onChange={(e) => setField("trigliceridos", e.target.value)} />
          </div>

          <div>
            <label>TSH</label>
            <input value={form.tsh} onChange={(e) => setField("tsh", e.target.value)} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Observaciones</label>
            <textarea value={form.observaciones} onChange={(e) => setField("observaciones", e.target.value)} />
          </div>

          <div className="actions">
            <button onClick={crear}>Guardar</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Historial</h3>

        {labs.length === 0 ? (
          <p className="muted">Todavía no hay registros de laboratorio.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Glucosa</th>
                <th>Col. Total</th>
                <th>HDL</th>
                <th>LDL</th>
                <th>Trig.</th>
                <th>TSH</th>
                <th>Obs.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {labs.map((l) => (
                <tr key={l.id}>
                  <td>{l.fecha}</td>
                  <td>{l.glucosa || "-"}</td>
                  <td>{l.colesterol_total || "-"}</td>
                  <td>{l.hdl || "-"}</td>
                  <td>{l.ldl || "-"}</td>
                  <td>{l.trigliceridos || "-"}</td>
                  <td>{l.tsh || "-"}</td>
                  <td style={{ maxWidth: 260 }}>{l.observaciones || "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-danger" onClick={() => eliminar(l.id)}>
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
