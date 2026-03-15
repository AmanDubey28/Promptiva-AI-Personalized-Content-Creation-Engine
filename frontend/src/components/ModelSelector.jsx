const MODEL_META = {
  gemini: { label: "Gemini", icon: "✦", color: "#4285F4", desc: "Google DeepMind" },
  mistral: { label: "Mistral", icon: "⚡", color: "#FF7000", desc: "Mistral AI" },
  llama: { label: "LLaMA", icon: "🦙", color: "#8B5CF6", desc: "Meta AI" },
};

export default function ModelSelector({ availableModels, selectedModels, onToggle }) {
  return (
    <div>
      <p style={{
        fontSize: "11px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "#555",
        fontWeight: "600",
        marginBottom: "12px",
        fontFamily: "'Courier New', monospace",
      }}>Select Models</p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {availableModels.map((model) => {
          const meta = MODEL_META[model] || { label: model, icon: "◆", color: "#888", desc: "" };
          const selected = selectedModels.includes(model);
          return (
            <button
              key={model}
              onClick={() => onToggle(model)}
              style={{
                padding: "10px 20px",
                borderRadius: "40px",
                border: `1.5px solid ${selected ? meta.color : "#2a2a2a"}`,
                background: selected ? `${meta.color}18` : "#141414",
                color: selected ? meta.color : "#555",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                outline: "none",
              }}
            >
              <span style={{ fontSize: "15px" }}>{meta.icon}</span>
              {meta.label}
              {selected && (
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: meta.color, display: "inline-block",
                  boxShadow: `0 0 6px ${meta.color}`,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
