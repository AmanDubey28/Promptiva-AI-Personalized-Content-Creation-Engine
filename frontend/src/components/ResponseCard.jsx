const MODEL_COLORS = {
  gemini: "#4285F4",
  mistral: "#FF7000",
  llama: "#8B5CF6",
};

const MODEL_ICONS = {
  gemini: "✦",
  mistral: "⚡",
  llama: "🦙",
};

export default function ResponseCard({ model, text }) {
  const color = MODEL_COLORS[model] || "#4CAF50";
  const icon = MODEL_ICONS[model] || "◆";
  const isError = typeof text === "object" && text.status === "error";

  return (
    <div style={{
      background: "#0f0f0f",
      border: `1px solid ${isError ? "#ff453a33" : `${color}22`}`,
      borderRadius: "16px",
      overflow: "hidden",
      width: "100%",
      maxWidth: "820px",
      animation: "slideUp 0.4s ease forwards",
    }}>
      {/* Header bar */}
      <div style={{
        padding: "14px 20px",
        borderBottom: `1px solid ${color}18`,
        background: `${color}08`,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: `${color}18`,
          border: `1.5px solid ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px",
        }}>{icon}</div>
        <div>
          <span style={{ fontSize: "13px", fontWeight: "700", color, letterSpacing: "1.5px", textTransform: "uppercase" }}>{model}</span>
          <div style={{ fontSize: "10px", color: "#444", letterSpacing: "0.5px", marginTop: "1px" }}>AI Response</div>
        </div>
        <div style={{
          marginLeft: "auto",
          width: "8px", height: "8px", borderRadius: "50%",
          background: isError ? "#ff453a" : color,
          boxShadow: `0 0 8px ${isError ? "#ff453a" : color}`,
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px" }}>
        {isError ? (
          <p style={{ color: "#ff6b6b", fontSize: "14px", margin: 0 }}>⚠ {text.message}</p>
        ) : (
          <p style={{
            color: "#C8C4BC",
            lineHeight: "1.8",
            fontSize: "15px",
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "'Georgia', serif",
          }}>{text}</p>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
