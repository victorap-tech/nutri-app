function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function rangoImc(imc) {
  if (imc == null) return { label: "—", level: "none" };
  if (imc < 18.5) return { label: "Bajo peso", level: "low" };
  if (imc < 25) return { label: "Normal", level: "ok" };
  if (imc < 30) return { label: "Sobrepeso", level: "warn" };
  return { label: "Obesidad", level: "high" };
}

export default function IMCBar({ peso, altura }) {
  let imc = null;
  if (peso && altura) {
    imc = peso / (altura * altura);
    imc = Math.round(imc * 10) / 10;
  }

  const { label, level } = rangoImc(imc);

  // Barra visual 15 a 40
  const pct = imc == null ? 0 : ((clamp(imc, 15, 40) - 15) / (40 - 15)) * 100;

  return (
    <div className="card">
      <h3>IMC</h3>
      <div className="imc-value">{imc ?? "—"}</div>

      <div className="imc-bar">
        <div className="imc-track" />
        <div className="imc-marker" style={{ left: `${pct}%` }} />
      </div>

      <div className={`pill ${level}`}>{label}</div>

      <div className="imc-legend">
        <span>Bajo</span>
        <span>Normal</span>
        <span>Sobre</span>
        <span>Obes</span>
      </div>
    </div>
  );
}
