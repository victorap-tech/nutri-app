import { useEffect, useState } from "react";
import { api } from "../api/api";

const FORM_VACIO = { nombre: "", categoria: "", calorias: "" };

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([]);
  const [error, setError]   = useState("");
  const [msg, setMsg]       = useState(null);
  const [form, setForm]     = useState(FORM_VACIO);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [busqueda, setBusqueda] = useState("");

  const flash = (tipo, texto) => {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 3000);
  };

  const cargar = async () => {
    try {
      const data = await api.get("/alimentos");
      setAlimentos(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { cargar(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const crear = async () => {
    if (!form.nombre || !form.categoria) return;
    try {
      await api.post("/alimentos", form);
      setForm(FORM_VACIO);
      await cargar();
      flash("success", "Alimento agregado");
    } catch (e) {
      setError(e.message);
    }
  };

  const iniciarEdicion = (a) => {
    setEditId(a.id);
    setEditForm({ nombre: a.nombre, categoria: a.categoria, calorias: a.calorias ?? "" });
  };

  const guardarEdicion = async (id) => {
    try {
      await api.put(`/alimentos/${id}`, editForm);
      setEditId(null);
      await cargar();
      flash("success", "Alimento actualizado");
    } catch (e) {
      setError(e.message);
    }
  };

  const cancelarEdicion = () => setEditId(null);

  const eliminar = async (id) => {
    if (!window.confirm("¿Desactivar este alimento?")) return;
    try {
      await api.delete(`/alimentos/${id}`);
      await cargar();
      flash("success", "Alimento eliminado");
    } catch (e) {
      setError(e.message);
    }
  };

  const filtrados = alimentos.filter(a =>
    `${a.nombre} ${a.categoria}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agrupar por categoría
  const porCategoria = filtrados.reduce((acc, a) => {
    const cat = a.categoria || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="page-title" style={{ marginBottom: 4 }}>Alimentos</div>
          <div className="page-subtitle">{alimentos.length} alimentos en el catálogo</div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
      {msg   && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

      {/* ── Formulario nuevo ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Agregar alimento</div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nombre *</label>
            <input placeholder="ej: Avena" value={form.nombre} onChange={e => set("nombre", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Categoría *</label>
            <input placeholder="ej: Cereales" value={form.categoria} onChange={e => set("categoria", e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Calorías (kcal)</label>
            <input type="number" placeholder="ej: 389" value={form.calorias} onChange={e => set("calorias", e.target.value)} />
          </div>
        </div>
        <button className="btn-primary" onClick={crear} style={{ marginTop: 12 }}
          disabled={!form.nombre || !form.categoria}>
          + Agregar alimento
        </button>
      </div>

      {/* ── Buscador ── */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="search-input"
          placeholder="Buscar por nombre o categoría..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* ── Tabla agrupada por categoría ── */}
      {alimentos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🥦</div>
          <p>No hay alimentos cargados aún.</p>
        </div>
      ) : (
        Object.entries(porCategoria).sort().map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "var(--accent)",
              marginBottom: 8, padding: "4px 10px",
              background: "var(--accent-light)", borderRadius: "var(--radius-sm)",
              display: "inline-block"
            }}>
              {cat} · {items.length}
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Calorías</th>
                    <th style={{ width: 120 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(a => (
                    <tr key={a.id}>
                      {editId === a.id ? (
                        <>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={editForm.nombre}
                                onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                                style={{ marginBottom: 0 }}
                              />
                              <input
                                value={editForm.categoria}
                                onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}
                                placeholder="Categoría"
                                style={{ marginBottom: 0 }}
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={editForm.calorias}
                              onChange={e => setEditForm(f => ({ ...f, calorias: e.target.value }))}
                              style={{ marginBottom: 0, maxWidth: 80 }}
                            />
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="btn-primary" style={{ padding: "6px 12px", height: "auto" }} onClick={() => guardarEdicion(a.id)}>✓</button>
                              <button className="btn-secondary" style={{ padding: "6px 12px", height: "auto" }} onClick={cancelarEdicion}>✕</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ fontWeight: 500 }}>{a.nombre}</td>
                          <td style={{ color: "var(--text-muted)" }}>{a.calorias ? `${a.calorias} kcal` : "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                              <button className="btn-icon" onClick={() => iniciarEdicion(a)} title="Editar">✏️</button>
                              <button className="btn-icon" onClick={() => eliminar(a.id)} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
