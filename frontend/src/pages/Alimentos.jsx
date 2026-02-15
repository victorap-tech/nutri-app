import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    calorias: "",
  });

  async function cargar() {
    try {
      const data = await api.get("/alimentos");
      setAlimentos(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function crear() {
    try {
      await api.post("/alimentos", form);
      setForm({ nombre: "", categoria: "", calorias: "" });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function eliminar(id) {
    try {
      await api.delete(`/alimentos/${id}`);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <h2>Alimentos (catálogo global)</h2>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <h3>Nuevo alimento</h3>

        <div className="grid">
          <div>
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
            />
          </div>

          <div>
            <label>Categoría</label>
            <input
              value={form.categoria}
              onChange={(e) => setField("categoria", e.target.value)}
            />
          </div>

          <div>
            <label>Calorías (opcional)</label>
            <input
              value={form.calorias}
              onChange={(e) => setField("calorias", e.target.value)}
            />
          </div>

          <div className="actions">
            <button onClick={crear}>Guardar</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Listado</h3>

        {alimentos.length === 0 ? (
          <p className="muted">No hay alimentos cargados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Calorías</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alimentos.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{a.categoria}</td>
                  <td>{a.calorias || "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-danger"
                      onClick={() => eliminar(a.id)}
                    >
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
