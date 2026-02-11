import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

// ---------- helpers ----------
function parseNum(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  // soporta coma o punto
  const normalized = s.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function fmtDateISO(d) {
  // d: Date
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calcIMC(pesoKg, alturaM) {
  const p = parseNum(pesoKg);
  const a = parseNum(alturaM);
  if (!p || !a || a <= 0) return null;
  return p / (a * a);
}

function rangoIMC(imc) {
  if (imc == null) return { label: "—", key: "na" };
  if (imc < 18.5) return { label: "Bajo peso", key: "bajo" };
  if (imc < 25) return { label: "Normal", key: "normal" };
  if (imc < 30) return { label: "Sobrepeso", key: "sobre" };
  return { label: "Obesidad", key: "obeso" };
}

// ---------- main ----------
export default function App() {
  const [vista, setVista] = useState("inicio"); // inicio | pacientes | nuevoPaciente | ficha
  const [estadoBackend, setEstadoBackend] = useState("...");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [loadingVisitas, setLoadingVisitas] = useState(false);
  const [msg, setMsg] = useState("");

  // ---------- chequeo backend ----------
  useEffect(() => {
    fetch(`${API}/`)
      .then((res) => res.json())
      .then((data) => setEstadoBackend(data.status || "OK"))
      .catch(() => setEstadoBackend("Backend OFF"));
  }, []);

  // ---------- cargar pacientes ----------
  const cargarPacientes = async () => {
    setLoadingPacientes(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/pacientes`);
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg("No se pudieron cargar los pacientes.");
    } finally {
      setLoadingPacientes(false);
    }
  };

  // ---------- cargar visitas ----------
  const cargarVisitas = async (pacienteId) => {
    if (!pacienteId) return;
    setLoadingVisitas(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/pacientes/${pacienteId}/visitas`);
      const data = await res.json();
      setVisitas(Array.isArray(data) ? data : []);
    } catch (e) {
      setVisitas([]);
      setMsg("No se pudieron cargar las visitas.");
    } finally {
      setLoadingVisitas(false);
    }
  };

  // ---------- navegación ----------
  const irPacientes = async () => {
    setVista("pacientes");
    await cargarPacientes();
  };

  const abrirFicha = async (paciente) => {
    setPacienteActivo(paciente);
    setVista("ficha");
    await cargarVisitas(paciente.id);
  };

  // ---------- componentes ----------
  function TopBar() {
    return (
      <div className="topbar">
        <div>
          <h1 className="title">Nutri App</h1>
          <div className="subtitle">
            Estado:{" "}
            <span
              className={
                estadoBackend === "Nutri App OK" || estadoBackend === "OK"
                  ? "status ok"
                  : "status off"
              }
            >
              {estadoBackend}
            </span>
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={() => setVista("inicio")}>
            Inicio
          </button>
          <button className="btn" onClick={irPacientes}>
            Pacientes
          </button>
          <button
            className="btn primary"
            onClick={() => setVista("nuevoPaciente")}
          >
            + Nuevo paciente
          </button>
        </div>
      </div>
    );
  }

  // ---------- Nuevo Paciente ----------
  function NuevoPaciente() {
    const [form, setForm] = useState({
      nombre: "",
      apellido: "",
      dni: "",
      edad: "",
      altura: "",
      peso: "",
    });
    const [saving, setSaving] = useState(false);

    const guardar = async () => {
      setMsg("");
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni: String(form.dni).trim(),
        edad: parseNum(form.edad),
        altura: parseNum(form.altura),
        peso: parseNum(form.peso),
      };

      if (!payload.nombre || !payload.apellido || !payload.dni) {
        setMsg("Nombre, apellido y DNI son obligatorios.");
        return;
      }

      setSaving(true);
      try {
        const res = await fetch(`${API}/pacientes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Error creando paciente");
        }

        await cargarPacientes();
        setVista("pacientes");
      } catch (e) {
        setMsg("No se pudo guardar el paciente (revisá DNI duplicado u otro error).");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="card">
        <h2>Nuevo paciente</h2>

        <div className="grid2">
          <div className="field">
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Ramón"
            />
          </div>

          <div className="field">
            <label>Apellido</label>
            <input
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              placeholder="Ej: Ayala"
            />
          </div>

          <div className="field">
            <label>DNI</label>
            <input
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
              placeholder="Ej: 24564786"
            />
          </div>

          <div className="field">
            <label>Edad</label>
            <input
              value={form.edad}
              type="text"
              onChange={(e) => setForm({ ...form, edad: e.target.value })}
              placeholder="Ej: 47"
            />
          </div>

          <div className="field">
            <label>Altura (m)</label>
            <input
              value={form.altura}
              type="text"
              onChange={(e) => setForm({ ...form, altura: e.target.value })}
              placeholder="Ej: 1,72"
            />
          </div>

          <div className="field">
            <label>Peso (kg)</label>
            <input
              value={form.peso}
              type="text"
              onChange={(e) => setForm({ ...form, peso: e.target.value })}
              placeholder="Ej: 95"
            />
          </div>
        </div>

        <div className="row">
          <button className="btn" onClick={() => setVista("pacientes")}>
            ← Volver
          </button>
          <button className="btn primary" onClick={guardar} disabled={saving}>
            {saving ? "Guardando..." : "Guardar paciente"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Lista Pacientes ----------
  function ListaPacientes() {
    useEffect(() => {
      cargarPacientes();
    }, []);

    return (
      <div className="card">
        <h2>Pacientes</h2>

        {loadingPacientes && <p>Cargando...</p>}

        {!loadingPacientes && pacientes.length === 0 && (
          <p>No hay pacientes cargados.</p>
        )}

        <div className="list-vertical">
          {pacientes.map((p) => (
            <button
              className="list-item"
              key={p.id}
              onClick={() => abrirFicha(p)}
            >
              <div className="list-item-title">
                {p.apellido}, {p.nombre}
              </div>
              <div className="list-item-sub">DNI: {p.dni}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- Form Edit Paciente ----------
  function EditPacienteCard() {
    const [edit, setEdit] = useState(() => ({
      nombre: pacienteActivo?.nombre ?? "",
      apellido: pacienteActivo?.apellido ?? "",
      dni: pacienteActivo?.dni ?? "",
      edad: pacienteActivo?.edad ?? "",
      altura: pacienteActivo?.altura ?? "",
      peso: pacienteActivo?.peso ?? "",
    }));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      // si cambia pacienteActivo
      setEdit({
        nombre: pacienteActivo?.nombre ?? "",
        apellido: pacienteActivo?.apellido ?? "",
        dni: pacienteActivo?.dni ?? "",
        edad: pacienteActivo?.edad ?? "",
        altura: pacienteActivo?.altura ?? "",
        peso: pacienteActivo?.peso ?? "",
      });
    }, [pacienteActivo?.id]);

    const guardarCambios = async () => {
      setMsg("");
      if (!pacienteActivo) return;

      const payload = {
        nombre: String(edit.nombre).trim(),
        apellido: String(edit.apellido).trim(),
        dni: String(edit.dni).trim(),
        edad: parseNum(edit.edad),
        altura: parseNum(edit.altura),
        peso: parseNum(edit.peso),
      };

      if (!payload.nombre || !payload.apellido || !payload.dni) {
        setMsg("Nombre, apellido y DNI son obligatorios.");
        return;
      }

      setSaving(true);
      try {
        const res = await fetch(`${API}/pacientes/${pacienteActivo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Error editando paciente");
        }

        // refrescar lista pacientes y pacienteActivo
        await cargarPacientes();
        setPacienteActivo((prev) => (prev ? { ...prev, ...payload } : prev));
        setMsg("Cambios guardados.");
        setTimeout(() => setMsg(""), 1500);
      } catch (e) {
        setMsg("No se pudieron guardar los cambios del paciente.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="card">
        <h2>Datos del paciente (editables)</h2>

        <div className="grid2">
          <div className="field">
            <label>Nombre</label>
            <input
              value={edit.nombre}
              onChange={(e) => setEdit({ ...edit, nombre: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Apellido</label>
            <input
              value={edit.apellido}
              onChange={(e) => setEdit({ ...edit, apellido: e.target.value })}
            />
          </div>

          <div className="field">
            <label>DNI</label>
            <input
              value={edit.dni}
              onChange={(e) => setEdit({ ...edit, dni: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Edad</label>
            <input
              value={edit.edad}
              onChange={(e) => setEdit({ ...edit, edad: e.target.value })}
              placeholder="Ej: 47"
            />
          </div>

          <div className="field">
            <label>Altura (m)</label>
            <input
              value={edit.altura}
              onChange={(e) => setEdit({ ...edit, altura: e.target.value })}
              placeholder="Ej: 1,72"
            />
          </div>

          <div className="field">
            <label>Peso (kg)</label>
            <input
              value={edit.peso}
              onChange={(e) => setEdit({ ...edit, peso: e.target.value })}
              placeholder="Ej: 95"
            />
          </div>
        </div>

        <div className="row">
          <button className="btn primary" onClick={guardarCambios} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Nueva Visita ----------
  function NuevaVisitaCard({ onCreated }) {
    const hoy = fmtDateISO(new Date());
    const [form, setForm] = useState({
      fecha: hoy,
      peso: pacienteActivo?.peso ?? "",
      altura: pacienteActivo?.altura ?? "",
      cintura: "",
      diagnostico: "",
    });
    const [saving, setSaving] = useState(false);

    const imc = useMemo(() => calcIMC(form.peso, form.altura), [form.peso, form.altura]);
    const rango = useMemo(() => rangoIMC(imc), [imc]);

    const crear = async () => {
      setMsg("");
      if (!pacienteActivo) return;

      const payload = {
        fecha: String(form.fecha).trim(),
        peso: parseNum(form.peso),
        altura: parseNum(form.altura),
        cintura: parseNum(form.cintura),
        diagnostico: String(form.diagnostico || "").trim(),
      };

      if (!payload.fecha) {
        setMsg("La fecha es obligatoria.");
        return;
      }

      if (!payload.peso || !payload.altura) {
        setMsg("Peso y altura son obligatorios para calcular el IMC.");
        return;
      }

      setSaving(true);
      try {
        const res = await fetch(`${API}/pacientes/${pacienteActivo.id}/visitas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Error creando visita");
        }

        setForm((p) => ({ ...p, cintura: "", diagnostico: "" }));
        await onCreated();
      } catch (e) {
        setMsg("No se pudo crear la visita.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="card">
        <h2>Nueva visita</h2>

        <div className="grid2">
          <div className="field">
            <label>Fecha de visita</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Cintura (cm)</label>
            <input
              value={form.cintura}
              onChange={(e) => setForm({ ...form, cintura: e.target.value })}
              placeholder="Ej: 104"
            />
          </div>

          <div className="field">
            <label>Peso (kg)</label>
            <input
              value={form.peso}
              onChange={(e) => setForm({ ...form, peso: e.target.value })}
              placeholder="Ej: 92,5"
            />
          </div>

          <div className="field">
            <label>Altura (m)</label>
            <input
              value={form.altura}
              onChange={(e) => setForm({ ...form, altura: e.target.value })}
              placeholder="Ej: 1,72"
            />
          </div>
        </div>

        <div className="imcBox">
          <div>
            <div className="imcTitle">IMC</div>
            <div className="imcValue">
              {imc == null ? "—" : imc.toFixed(1)}
            </div>
          </div>
          <div className={`imcBadge ${rango.key}`}>
            {rango.label}
          </div>
        </div>

        <div className="field">
          <label>Diagnóstico (de esta visita)</label>
          <textarea
            className="textarea-full"
            value={form.diagnostico}
            onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
            placeholder="Escriba el diagnóstico del paciente..."
            rows={3}
          />
        </div>

        <div className="row">
          <button className="btn primary" onClick={crear} disabled={saving}>
            {saving ? "Guardando..." : "Guardar visita"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Gráfico IMC ----------
  function GraficoIMC({ visitas }) {
    // visitas: [{fecha, peso, altura, ...}]
    // armamos puntos ordenados
    const puntos = useMemo(() => {
      const arr = (visitas || [])
        .map((v) => {
          const imc = calcIMC(v.peso, v.altura);
          return {
            fecha: v.fecha,
            imc,
          };
        })
        .filter((p) => p.imc != null)
        .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      return arr;
    }, [visitas]);

    // gráfico simple en HTML: usamos una "línea" con barras verticales posicionadas
    // (sin librerías para que sea 100% compatible)
    // Definimos rango Y [15..40]
    const yMin = 15;
    const yMax = 40;

    const scaleY = (imc) => {
      const clamped = Math.max(yMin, Math.min(yMax, imc));
      const pct = (clamped - yMin) / (yMax - yMin);
      // 0 abajo, 1 arriba -> convertimos a top
      return 100 - pct * 100;
    };

    return (
      <div className="card">
        <h2>Gráfico IMC (evolución)</h2>

        {puntos.length === 0 ? (
          <p>No hay datos suficientes para graficar.</p>
        ) : (
          <div className="chartWrap">
            {/* bandas */}
            <div className="band bajo" title="Bajo peso (<18.5)" />
            <div className="band normal" title="Normal (18.5–24.9)" />
            <div className="band sobre" title="Sobrepeso (25–29.9)" />
            <div className="band obeso" title="Obesidad (≥30)" />

            {/* puntos */}
            <div className="chartArea">
              {puntos.map((p, idx) => {
                const left = (idx / (puntos.length - 1)) * 100;
                const top = scaleY(p.imc);
                const r = rangoIMC(p.imc).key;
                return (
                  <div
                    key={`${p.fecha}-${idx}`}
                    className={`dot ${r}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    title={`${p.fecha} — IMC ${p.imc.toFixed(1)}`}
                  />
                );
              })}

              {/* línea (segmentos) */}
              {puntos.map((p, idx) => {
                if (idx === 0) return null;
                const prev = puntos[idx - 1];
                const x1 = ((idx - 1) / (puntos.length - 1)) * 100;
                const y1 = scaleY(prev.imc);
                const x2 = (idx / (puntos.length - 1)) * 100;
                const y2 = scaleY(p.imc);

                const dx = x2 - x1;
                const dy = y2 - y1;

                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                return (
                  <div
                    key={`line-${idx}`}
                    className="line"
                    style={{
                      left: `${x1}%`,
                      top: `${y1}%`,
                      width: `${len}%`,
                      transform: `rotate(${angle}deg)`,
                    }}
                  />
                );
              })}
            </div>

            <div className="chartAxis">
              <div className="axisLabel top">{yMax}</div>
              <div className="axisLabel mid">27.5</div>
              <div className="axisLabel bot">{yMin}</div>
            </div>

            <div className="chartX">
              {puntos.map((p, idx) => (
                <div key={`x-${idx}`} className="xLabel">
                  {String(p.fecha).slice(5)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- Historial Visitas ----------
  function HistorialVisitas() {
    const ordenadas = useMemo(() => {
      return [...(visitas || [])].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    }, [visitas]);

    return (
      <div className="card">
        <h2>Historial de visitas</h2>

        {loadingVisitas && <p>Cargando visitas...</p>}

        {!loadingVisitas && ordenadas.length === 0 && (
          <p>Aún no hay visitas registradas.</p>
        )}

        <div className="visitasList">
          {ordenadas.map((v, idx) => {
            const imc = calcIMC(v.peso, v.altura);
            const r = rangoIMC(imc);
            return (
              <div className="visitaItem" key={`${v.fecha}-${idx}`}>
                <div className="visitaHeader">
                  <div className="visitaFecha">{v.fecha}</div>
                  <div className={`imcBadge ${r.key}`}>
                    IMC {imc == null ? "—" : imc.toFixed(1)} · {r.label}
                  </div>
                </div>

                <div className="visitaGrid">
                  <div><b>Peso:</b> {v.peso ?? "—"} kg</div>
                  <div><b>Altura:</b> {v.altura ?? "—"} m</div>
                  <div><b>Cintura:</b> {v.cintura ?? "—"} cm</div>
                </div>

                {v.diagnostico && (
                  <div className="visitaDiag">
                    <b>Diagnóstico:</b> {v.diagnostico}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- Ficha Paciente ----------
  function FichaPaciente() {
    if (!pacienteActivo) return null;

    return (
      <div className="stack">
        <div className="row">
          <button className="btn" onClick={() => setVista("pacientes")}>
            ← Volver a pacientes
          </button>
        </div>

        <div className="gridFicha">
          {/* Columna izquierda */}
          <div className="stack">
            <EditPacienteCard />
            <NuevaVisitaCard
              onCreated={async () => {
                await cargarVisitas(pacienteActivo.id);
              }}
            />
            <HistorialVisitas />
          </div>

          {/* Columna derecha */}
          <div className="stack">
            <GraficoIMC visitas={visitas} />
          </div>
        </div>
      </div>
    );
  }

  // ---------- render ----------
  return (
    <div className="app">
      <TopBar />

      {msg && <div className="msg">{msg}</div>}

      {vista === "inicio" && (
        <div className="card">
          <h2>Inicio</h2>
          <p>Usá los botones de arriba para manejar pacientes y visitas.</p>
        </div>
      )}

      {vista === "pacientes" && <ListaPacientes />}
      {vista === "nuevoPaciente" && <NuevoPaciente />}
      {vista === "ficha" && <FichaPaciente />}
    </div>
  );
}
