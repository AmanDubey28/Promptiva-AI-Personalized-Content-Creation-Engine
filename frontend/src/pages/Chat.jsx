import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateContent, getHistory, clearAuthToken } from "../services/api";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import QuoteDisplay from "../components/QuoteDisplay";
import "../styles/Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState(null);

  const contentTypes = [
    { id: "blog", name: "📝 Blog", icon: "📝" },
    { id: "linkedin", name: "💼 LinkedIn", icon: "💼" },
    { id: "instagram", name: "📸 Instagram", icon: "📸" },
    { id: "twitter", name: "𝕏 Twitter", icon: "𝕏" },
    { id: "email", name: "✉️ Email", icon: "✉️" },
    { id: "ad", name: "📢 Ad Copy", icon: "📢" },
  ];

  const contentTypeQuestions = {
    blog: "Write a compelling blog post about... (e.g., AI trends in 2024)",
    linkedin: "Create a professional LinkedIn post about... (e.g., career growth)",
    instagram: "Write a catchy Instagram caption for... (e.g., product launch)",
    twitter: "Write a witty tweet about... (e.g., current trending topic)",
    email: "Write a persuasive email subject and body for... (e.g., product promotion)",
    ad: "Create compelling ad copy for... (e.g., fitness app, eco-friendly product)",
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
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
      const response = await generateContent(prompt, false);
      setResult(response);
      setCurrentChatId(response.id);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = (item) => {
    if (item?.id) {
      setCurrentChatId(item.id);
      setResult(item);
      setPrompt(item.prompt);
    } else {
      setResult(null);
      setPrompt("");
      setCurrentChatId(null);
      setSelectedContentType(null);
      setError("");
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

  const getResponse = () => {
    if (!result?.response) return "No response available";
    return result.response;
  };

  return (
    <div className={`chat-container ${theme}`}>
      <Sidebar theme={theme} onNewChat={handleNewChat} currentChatId={currentChatId} />

      <div className="chat-main">
        {/* Top Bar */}
        <div className="chat-top-bar">
          <div className="top-bar-branding">
            <span className="app-logo">✨</span>
            <span className="app-name">Promptiva</span>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="chat-content">
          {!result ? (
            // Initial State - Center Promptiva with Content Type Selection
            <div className="welcome-section">
              <div className="welcome-content">
                <h1 className="welcome-title">
                  <span className="title-icon">✨</span>
                  <span>Promptiva</span>
                </h1>
                <p className="welcome-subtitle">
                  Your AI-Powered Content Creation Assistant
                </p>

                {!selectedContentType ? (
                  // Content Type Selection
                  <div className="content-type-selection">
                    <p className="selection-label">Choose a content type to get started:</p>
                    <div className="content-type-grid">
                      {contentTypes.map((type) => (
                        <div
                          key={type.id}
                          className="content-type-card"
                          onClick={() => setSelectedContentType(type.id)}
                        >
                          <span className="type-icon">{type.icon}</span>
                          <p className="type-name">{type.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Content Type Prompts
                  <div className="content-prompts">
                    <button
                      className="back-btn"
                      onClick={() => setSelectedContentType(null)}
                    >
                      ← Back to types
                    </button>
                    <p className="prompts-header">
                      {contentTypes.find((t) => t.id === selectedContentType)?.name || "Content"}
                    </p>
                    <div className="prompts-grid">
                      {[
                        `${contentTypeQuestions[selectedContentType]} - Technology`,
                        `${contentTypeQuestions[selectedContentType]} - Business`,
                        `${contentTypeQuestions[selectedContentType]} - Life & Wellness`,
                        `${contentTypeQuestions[selectedContentType]} - Creative`,
                      ].map((prompt, idx) => (
                        <div
                          key={idx}
                          className="prompt-card"
                          onClick={() => setPrompt(prompt)}
                        >
                          <p>{prompt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Split Screen View
            <div className="split-screen">
              {/* Left Side - Input & Controls */}
              <div className="split-left">
                <div className="input-section">
                  <div className="input-wrapper">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your prompt here... (Ctrl+Enter to generate)"
                      className="prompt-input"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="generate-btn"
                    >
                      {isLoading ? "✨ Generating..." : "✨ Generate"}
                    </button>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  {/* Result Meta */}
                  {result && (
                    <div className="result-meta">
                      <div className="meta-item">
                        <span className="meta-label">Generated</span>
                        <span className="meta-value">
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {result.winner_model && (
                        <div className="meta-item">
                          <span className="meta-label">Winner</span>
                          <span className="meta-value badge">
                            {result.winner_model}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Response */}
              <div className="split-right">
                <QuoteDisplay isLoading={isLoading} />

                {!isLoading && (
                  <div className="response-panel">
                    <div className="response-header">
                      <h3 className="response-title">Response</h3>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          const text = getResponse();
                          if (typeof text === "string") {
                            navigator.clipboard.writeText(text);
                            alert("Copied to clipboard!");
                          }
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>

                    <div className="response-content">
                      {typeof getResponse() === "string" ? (
                        <p>{getResponse()}</p>
                      ) : (
                        <p className="error">
                          {getResponse()?.message || "Error in response"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multi-line Input Footer (Initial State) */}
        {!result && (
          <div className="chat-input-footer">
            <div className="input-wrapper">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your prompt here... (Ctrl+Enter to generate)"
                className="prompt-input"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="generate-btn-footer"
              >
                {isLoading ? "✨ Generating..." : "✨ Generate"}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
