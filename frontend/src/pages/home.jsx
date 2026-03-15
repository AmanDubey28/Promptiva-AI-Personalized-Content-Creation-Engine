import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateContent, getHistory, clearAuthToken } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const COLORS = {
    primary: "#FF9500",
    primaryDark: "#FF6B35",
    bg: "#080808",
    bgSecondary: "#0f0f0f",
    border: "#1e1e1e",
    text: "#E8E3DA",
    textMuted: "#888",
    success: "#51cf66",
    error: "#ff6b6b",
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await generateContent(prompt, compareMode);
      setResult(response);
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  const renderModelResponses = () => {
    if (!result?.responses) return null;

    return (
      <div style={{ marginTop: "24px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: COLORS.text,
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {compareMode ? "Model Comparison" : "All Model Responses"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {Object.entries(result.responses).map(([model, response]) => (
            <div
              key={model}
              style={{
                background: COLORS.bgSecondary,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "16px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    color: COLORS.primary,
                    letterSpacing: "0.5px",
                  }}
                >
                  {model}
                </span>
                {result.winner?.model === model && compareMode && (
                  <div
                    style={{
                      background: COLORS.primary,
                      color: "#000",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    🏆 Winner
                  </div>
                )}
              </div>

              {typeof response === "string" ? (
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: COLORS.text,
                    margin: "0",
                    wordBreak: "break-word",
                  }}
                >
                  {response}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "13px",
                    color: COLORS.error,
                    margin: "0",
                  }}
                >
                  Error: {response.message || "Unknown error"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgSecondary} 100%)`,
        color: COLORS.text,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0",
            }}
          >
            Promptiva
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: COLORS.textMuted,
              margin: "4px 0 0 0",
            }}
          >
            AI Personal Content Creation Engine
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {user && (
            <div
              style={{
                fontSize: "13px",
                color: COLORS.textMuted,
              }}
            >
              👤 {user.username}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.color = COLORS.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = COLORS.border;
              e.target.style.color = COLORS.text;
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
        {/* Input Section */}
        <div
          style={{
            background: COLORS.bgSecondary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: COLORS.text,
            }}
          >
            Enter Your Prompt
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you'd like me to create..."
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              color: COLORS.text,
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
          />

          {/* Options */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: COLORS.text,
              }}
            >
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: COLORS.primary,
                }}
              />
              Compare all models and show the best result
            </label>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              style={{
                padding: "10px 24px",
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                color: "#000",
                border: "none",
                borderRadius: "6px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 16px rgba(255, 149, 0, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "none";
                e.target.style.boxShadow = "none";
              }}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "rgba(255, 107, 107, 0.1)",
              border: `1px solid ${COLORS.error}`,
              color: COLORS.error,
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "24px",
              fontSize: "13px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {compareMode && result.winner && (
              <div
                style={{
                  background: COLORS.bgSecondary,
                  border: `2px solid ${COLORS.primary}`,
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "32px",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: "0 0 8px 0",
                      color: COLORS.primary,
                    }}
                  >
                    🏆 Best Response
                  </h2>
                  <p
                    style={{
                      fontSize: "12px",
                      color: COLORS.textMuted,
                      margin: "0",
                    }}
                  >
                    by {result.winner.model}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: COLORS.text,
                    margin: "12px 0 0 0",
                  }}
                >
                  {result.winner.response}
                </p>
              </div>
            )}

            {!compareMode && result.winner && (
              <div
                style={{
                  background: COLORS.bgSecondary,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "32px",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 12px 0",
                    color: COLORS.text,
                  }}
                >
                  Response from {result.winner.model}
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: COLORS.text,
                    margin: "0",
                  }}
                >
                  {result.winner.response}
                </p>
              </div>
            )}

            {renderModelResponses()}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && !result && (
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                color: COLORS.text,
              }}
            >
              Recent Generations
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              {history.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPrompt(item.prompt)}
                  style={{
                    background: COLORS.bgSecondary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: COLORS.text,
                      margin: "0 0 8px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.prompt}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: COLORS.textMuted,
                      margin: "0",
                    }}
                  >
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
