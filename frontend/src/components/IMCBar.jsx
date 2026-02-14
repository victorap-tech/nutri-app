export default function IMCBar({ imc, rango }) {
  if (!imc) return null;

  let color = "#28a745";

  if (imc < 18.5) color = "#17a2b8";
  else if (imc < 25) color = "#28a745";
  else if (imc < 30) color = "#ffc107";
  else color = "#dc3545";

  return (
    <div className="imc-container">
      <div className="imc-bar">
        <div
          className="imc-fill"
          style={{ width: `${imc * 2}%`, background: color }}
        />
      </div>
      <p>IMC: {imc} - {rango}</p>
    </div>
  );
}
