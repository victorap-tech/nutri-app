export default function IMCBar({ imc, rango }) {
  if (!imc) return null;

  // Escala visual: 10 a 40 = 0% a 100%
  const pct = Math.min(Math.max(((imc - 10) / 30) * 100, 0), 100);

  const rangos = [
    { key: "Bajo peso",  min: 10,   max: 18.5, color: "#74c0fc", bg: "#e8f4fd", text: "#1a6098" },
    { key: "Normal",     min: 18.5, max: 25,   color: "#51cf66", bg: "#ebfbee", text: "#1a6630" },
    { key: "Sobrepeso",  min: 25,   max: 30,   color: "#ffd43b", bg: "#fff9db", text: "#7d5a00" },
    { key: "Obesidad",   min: 30,   max: 40,   color: "#ff6b6b", bg: "#fff0f0", text: "#c0392b" },
  ];

  const actual = rangos.find(r => rango === r.key) || rangos[1];

  return (
    <div style={{
      background: actual.bg,
      border: `1px solid ${actual.color}40`,
      borderRadius: "12px",
      padding: "18px 20px",
      marginTop: "16px",
    }}>
      {/* Título */}
      <div style={{
        fontSize: "0.7rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: actual.text,
        marginBottom: "10px",
        opacity: 0.7,
      }}>
        Índice de Masa Corporal
      </div>

      {/* Valor grande + rango */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "14px" }}>
        <div style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          fontSize: "2.6rem",
          fontWeight: 300,
          lineHeight: 1,
          color: actual.text,
        }}>
          {imc}
        </div>
        <div style={{ paddingBottom: "4px" }}>
          <div style={{ fontSize: "0.72rem", color: actual.text, opacity: 0.6 }}>kg/m²</div>
          <div style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: actual.text,
          }}>
            {rango}
          </div>
        </div>
      </div>

      {/* Barra */}
      <div style={{ position: "relative" }}>
        {/* Segmentos de color */}
        <div style={{
          display: "flex",
          height: "10px",
          borderRadius: "99px",
          overflow: "hidden",
          gap: "2px",
        }}>
          {rangos.map(r => {
            const width = ((r.max - r.min) / 30) * 100;
            return (
              <div key={r.key} style={{
                flex: `0 0 ${width}%`,
                background: r.color,
                opacity: rango === r.key ? 1 : 0.3,
                borderRadius: "99px",
                transition: "opacity 0.3s",
              }} />
            );
          })}
        </div>

        {/* Marcador */}
        <div style={{
          position: "absolute",
          top: "-4px",
          left: `${pct}%`,
          transform: "translateX(-50%)",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: actual.color,
          border: "2.5px solid white",
          boxShadow: `0 2px 6px ${actual.color}80`,
          transition: "left 0.4s ease",
        }} />
      </div>

      {/* Escala */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "8px",
        fontSize: "0.68rem",
        color: actual.text,
        opacity: 0.5,
      }}>
        {rangos.map(r => (
          <span key={r.key}>{r.min}</span>
        ))}
        <span>40</span>
      </div>

      {/* Leyenda */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginTop: "12px",
        flexWrap: "wrap",
      }}>
        {rangos.map(r => (
          <div key={r.key} style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.7rem",
            color: rango === r.key ? r.text : "var(--text-light, #aaa)",
            fontWeight: rango === r.key ? 600 : 400,
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: r.color,
              opacity: rango === r.key ? 1 : 0.4,
            }} />
            {r.key}
          </div>
        ))}
      </div>
    </div>
  );
}
