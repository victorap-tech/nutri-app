import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ nombre: "", categoria: "", calorias: "" });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function cargar() {
    setErr("");
    try {
      const a = await api.listarAlimentos();
      setAlimentos(a);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return alimentos;
    return alimentos.filter((a) =>
      `${a.nombre} ${a.categoria}`.toLowerCase().includes(t)
    );
  }, [alimentos, q]);

  async function crear() {
    setErr("");
    try {
      await api.crearAlimento({
        nombre: form.nombre,
        categoria: form.categoria,
        calorias: form.calorias ? Number(String(form.calorias).replace(",", ".")) : null,
      });
      setForm({ nombre: "", categoria: "", calorias: "" });
      await cargar();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function editar(item) {
    const nombre = prompt("Nombre:", item.nombre);
    if (nombre == null) return;
    const categoria = prompt("Categoría:", item.categoria || "");
    if (categoria == null) return;
    const calorias = prompt("Calorías (opcional):", item.calorias ?? "");
    if (calorias == null) return;

    try {
      await api.actualizarAlimento(item.id, {
        nombre,
        categoria,
        calorias: calorias === "" ? null : Number(String(calorias).replace(",", ".")),
      });
      await cargar();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;
    try {
      await api.eliminarAlimento(item.id);
      await cargar();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  return (
    <div className="container">
      <h1>Alimentos (catálogo global)</h1>

      {err && <div className="alert error">{err}</div>}

      <div className="card">
        <h3>Nuevo alimento</h3>
        <div className="form-grid">
          <label>Nombre<input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} /></label>
          <label>Categoría<input value={form.categoria} onChange={(e) => set("categoria", e.target.value)} /></label>
          <label>Calorías (opcional)<input value={form.calorias} onChange={(e) => set("calorias", e.target.value)} /></label>
        </div>
        <div className="row-end">
          <button className="btn primary" onClick={crear}>Guardar</button>
        </div>
      </div>

      <div className="searchbar">
        <input placeholder="Buscar alimentos..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card">
        <h3>Lista</h3>
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
            {filtrados.map((a) => (
              <tr key={a.id}>
                <td>{a.nombre}</td>
                <td>{a.categoria}</td>
                <td>{a.calorias ?? "—"}</td>
                <td className="row gap">
                  <button className="btn" onClick={() => editar(a)}>Editar</button>
                  <button className="btn danger" onClick={() => eliminar(a)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && <div className="muted">No hay alimentos.</div>}
      </div>
    </div>
  );
}
