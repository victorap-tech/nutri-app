import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api/api.js";

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => pacientes.find(p => p.id === selectedId) || null, [pacientes, selectedId]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Form paciente
  const [pNombre, setPNombre] = useState("");
  const [pEdad, setPEdad] = useState("");
  const [pAltura, setPAltura] = useState("");

  // Alimentos
  const [alimentos, setAlimentos] = useState([]);
  const [aNombre, setANombre] = useState("");
  const [aCategoria, setACategoria] = useState("Desayuno");
  const [aCal, setACal] = useState("");

  // Plan
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planFecha, setPlanFecha] = useState(todayISO());
  const [planIdDraft, setPlanIdDraft] = useState(null);

  // Agregar alimento a plan
  const [comida, setComida] = useState("Desayuno");
  const [alimentoId, setAlimentoId] = useState("");

  async function refreshPacientes() {
    setLoading(true);
    setToast("");
    try {
      const data = await api.pacientes();
      setPacientes(data);
      if (data.length && selectedId == null) setSelectedId(data[0].id);
    } catch (e) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshAlimentos() {
    try {
      const data = await api.alimentos();
      setAlimentos(data);
      if (data.length && !alimentoId) setAlimentoId(String(data[0].id));
    } catch (e) {
      setToast(e.message);
    }
  }

  async function refreshPlan(pacienteId) {
    if (!pacienteId) return;
    setPlanLoading(true);
    try {
      const data = await api.verPlanActual(pacienteId);
      setPlan(data);
      setPlanIdDraft(null);
    } catch {
      setPlan(null);
      setPlanIdDraft(null);
    } finally {
      setPlanLoading(false);
    }
  }

  useEffect(() => { refreshPacientes(); refreshAlimentos(); }, []);
  useEffect(() => { if (selectedId) refreshPlan(selectedId); }, [selectedId]);

  async function onCrearPaciente() {
    if (!pNombre.trim()) return setToast("Falta nombre del paciente.");
    setToast("");
    setLoading(true);
    try {
      const payload = {
        nombre: pNombre.trim(),
        edad: pEdad ? Number(pEdad) : undefined,
        altura: pAltura ? Number(pAltura) : undefined
      };
      const res = await api.crearPaciente(payload);
      await refreshPacientes();
      setSelectedId(res.id);
      setPNombre(""); setPEdad(""); setPAltura("");
      setToast("Paciente creado.");
    } catch (e) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onCrearAlimento() {
    if (!aNombre.trim()) return setToast("Falta nombre del alimento.");
    setToast("");
    try {
      const payload = {
        nombre: aNombre.trim(),
        categoria: aCategoria,
        calorias: aCal ? Number(aCal) : undefined
      };
      await api.crearAlimento(payload);
      setANombre(""); setACal("");
      await refreshAlimentos();
      setToast("Alimento cargado.");
    } catch (e) {
      setToast(e.message);
    }
  }

  async function onCrearPlan() {
    if (!selectedId) return;
    setToast("");
    try {
      const res = await api.crearPlan(selectedId, { fecha: planFecha });
      setPlanIdDraft(res.plan_id);
      setToast("Plan creado. Ahora agregá alimentos.");
      await refreshPlan(selectedId);
    } catch (e) {
      setToast(e.message);
    }
  }

  async function onCopiarPlan() {
    if (!selectedId) return;
    setToast("");
    try {
      const res = await api.copiarPlan(selectedId, { fecha: planFecha });
      setPlanIdDraft(res.plan_id);
      setToast("Plan copiado. Podés ajustar alimentos.");
      await refreshPlan(selectedId);
    } catch (e) {
      setToast(e.message);
    }
  }

  async function onAgregarAlimento() {
    const pid = planIdDraft || null;
    // si no hay draft, intentamos usar el plan actual, pero tu endpoint de agregar usa /planes/<id>
    // Como el GET devuelve solo fecha + alimentos, acá preferimos que haya plan creado/copiado reciente.
    if (!pid) return setToast("Primero creá o copiá un plan (así obtenemos el plan_id).");
    if (!alimentoId) return setToast("No hay alimentos cargados.");
    setToast("");
    try {
      await api.agregarAlimentoPlan(pid, { alimento_id: Number(alimentoId), comida });
      setToast("Alimento agregado al plan.");
    } catch (e) {
      setToast(e.message);
    }
  }

  return (
    <>
      <div className="nav">
        <div className="navInner">
          <div className="brand">
            <span>Nutri App</span>
            <span className="badge">Panel</span>
          </div>
          <div className="row">
            <span className="small">{loading ? "Cargando…" : "OK"}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid">
          {/* Izquierda: Pacientes */}
          <div className="card">
            <h2 className="h1">Pacientes</h2>
            <p className="p">Alta rápida y selección del paciente.</p>

            <hr className="sep" />

            <div className="row">
              <input className="input" placeholder="Nombre" value={pNombre} onChange={(e) => setPNombre(e.target.value)} />
              <input className="input" placeholder="Edad" value={pEdad} onChange={(e) => setPEdad(e.target.value)} />
              <input className="input" placeholder="Altura (m)" value={pAltura} onChange={(e) => setPAltura(e.target.value)} />
              <button className="btn btnPrimary" onClick={onCrearPaciente} disabled={loading}>Crear</button>
            </div>

            <hr className="sep" />

            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th>Altura</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelectedId(p.id)}>
                    <td>
                      <strong>{p.nombre}</strong>
                      {p.id === selectedId ? <span className="badge" style={{ marginLeft: 8 }}>Activo</span> : null}
                    </td>
                    <td>{p.edad ?? "-"}</td>
                    <td>{p.altura ?? "-"}</td>
                  </tr>
                ))}
                {!pacientes.length && (
                  <tr><td colSpan="3" className="small">Sin pacientes todavía.</td></tr>
                )}
              </tbody>
            </table>

            {toast ? <div className="toast">ℹ️ {toast}</div> : null}
          </div>

          {/* Derecha: Detalle */}
          <div className="card">
            <h2 className="h1">Paciente</h2>
            <p className="p">{selected ? `${selected.nombre}` : "Seleccioná un paciente"}</p>

            <hr className="sep" />

            <div className="row">
              <input className="input" value={planFecha} onChange={(e) => setPlanFecha(e.target.value)} />
              <button className="btn btnPrimary" onClick={onCrearPlan} disabled={!selectedId}>Nuevo plan</button>
              <button className="btn" onClick={onCopiarPlan} disabled={!selectedId}>Copiar plan anterior</button>
              {selectedId ? (
                <a className="btn" href={api.planPdfUrl(selectedId)} target="_blank" rel="noreferrer">
                  Descargar PDF
                </a>
              ) : null}
            </div>

            <hr className="sep" />

            <h3 className="h1" style={{ fontSize: 16 }}>Agregar alimento al plan</h3>
            <div className="row">
              <select className="input" value={comida} onChange={(e) => setComida(e.target.value)}>
                <option>Desayuno</option>
                <option>Media mañana</option>
                <option>Almuerzo</option>
                <option>Merienda</option>
                <option>Cena</option>
                <option>Colación</option>
              </select>

              <select className="input" value={alimentoId} onChange={(e) => setAlimentoId(e.target.value)}>
                {alimentos.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} ({a.categoria})</option>
                ))}
              </select>

              <button className="btn btnPrimary" onClick={onAgregarAlimento} disabled={!selectedId}>
                Agregar
              </button>
            </div>

            <hr className="sep" />

            <h3 className="h1" style={{ fontSize: 16 }}>Plan actual</h3>
            {planLoading ? (
              <p className="small">Cargando plan…</p>
            ) : plan ? (
              <>
                <p className="small">Fecha: {plan.fecha}</p>
                <table className="table" style={{ marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th>Comida</th>
                      <th>Alimento</th>
                      <th>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.alimentos.map((x, idx) => (
                      <tr key={idx}>
                        <td>{x.comida}</td>
                        <td><strong>{x.nombre}</strong></td>
                        <td>{x.categoria}</td>
                      </tr>
                    ))}
                    {!plan.alimentos.length && <tr><td colSpan="3" className="small">Plan vacío.</td></tr>}
                  </tbody>
                </table>
                <p className="small" style={{ marginTop: 10 }}>
                  Nota: Para agregar alimentos, primero creá o copiá un plan (así obtenemos el <code>plan_id</code>).
                </p>
              </>
            ) : (
              <p className="small">Sin plan todavía. Creá uno o copiá el anterior.</p>
            )}

            <hr className="sep" />

            <h3 className="h1" style={{ fontSize: 16 }}>Cargar alimentos</h3>
            <div className="row">
              <input className="input" placeholder="Nombre alimento" value={aNombre} onChange={(e) => setANombre(e.target.value)} />
              <select className="input" value={aCategoria} onChange={(e) => setACategoria(e.target.value)}>
                <option>Desayuno</option>
                <option>Media mañana</option>
                <option>Almuerzo</option>
                <option>Merienda</option>
                <option>Cena</option>
                <option>Colación</option>
                <option>General</option>
              </select>
              <input className="input" placeholder="Calorías (opcional)" value={aCal} onChange={(e) => setACal(e.target.value)} />
              <button className="btn btnPrimary" onClick={onCrearAlimento}>Cargar</button>
            </div>

            <p className="small" style={{ marginTop: 10 }}>
              Tip: cargá la lista según lo que se consigue en tu zona (tu idea original), y de ahí se arman los planes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
