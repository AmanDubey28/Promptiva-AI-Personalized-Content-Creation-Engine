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
  const [selectedModel, setSelectedModel] = useState("all"); // all, gemini, mistral, llama

  const models = ["gemini", "mistral", "llama"];

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

  const getBestResponse = () => {
    if (!result?.responses) return null;

    if (selectedModel === "all") {
      // Return the winner or first available response
      return (
        result.winner_response ||
        result.responses[0] ||
        "No response available"
      );
    } else {
      // Return specific model response
      const modelKey = selectedModel.toLowerCase();
      const responses = result.responses || {};
      return responses[modelKey] || "Response not available";
    }
  };

  const getResponseFromModel = (modelName) => {
    const responses = result?.responses || {};
    return responses[modelName] || "Response not available";
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
            // Initial State - Center Promptiva
            <div className="welcome-section">
              <div className="welcome-content">
                <h1 className="welcome-title">
                  <span className="title-icon">✨</span>
                  <span>Promptiva</span>
                </h1>
                <p className="welcome-subtitle">
                  Your AI-Powered Content Creation Assistant
                </p>

                <div className="examples-grid">
                  <div
                    className="example-card"
                    onClick={() =>
                      setPrompt(
                        "Write a compelling product description for an eco-friendly water bottle"
                      )
                    }
                  >
                    <span>💡</span>
                    <p>Write a product description</p>
                  </div>
                  <div
                    className="example-card"
                    onClick={() =>
                      setPrompt(
                        "Create an engaging social media post about sustainable living"
                      )
                    }
                  >
                    <span>📱</span>
                    <p>Create social media content</p>
                  </div>
                  <div
                    className="example-card"
                    onClick={() =>
                      setPrompt(
                        "Generate a blog post outline for a tech article"
                      )
                    }
                  >
                    <span>📝</span>
                    <p>Blog post outline</p>
                  </div>
                  <div
                    className="example-card"
                    onClick={() =>
                      setPrompt(
                        "Design a marketing campaign for a fitness app"
                      )
                    }
                  >
                    <span>🎨</span>
                    <p>Marketing campaign</p>
                  </div>
                </div>
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

                  {/* Model Selector */}
                  <div className="model-selector">
                    <label>Response Type:</label>
                    <div className="model-buttons">
                      <button
                        className={`model-btn ${selectedModel === "all" ? "active" : ""}`}
                        onClick={() => setSelectedModel("all")}
                      >
                        Best Response
                      </button>
                      <button
                        className={`model-btn ${selectedModel === "gemini" ? "active" : ""}`}
                        onClick={() => setSelectedModel("gemini")}
                      >
                        Option 1
                      </button>
                      <button
                        className={`model-btn ${selectedModel === "mistral" ? "active" : ""}`}
                        onClick={() => setSelectedModel("mistral")}
                      >
                        Option 2
                      </button>
                      <button
                        className={`model-btn ${selectedModel === "llama" ? "active" : ""}`}
                        onClick={() => setSelectedModel("llama")}
                      >
                        Option 3
                      </button>
                    </div>
                  </div>

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
                      <h3 className="response-title">
                        {selectedModel === "all" ? "Best Response" : `Option ${["gemini", "mistral", "llama"].indexOf(selectedModel) + 1}`}
                      </h3>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          const text = getBestResponse();
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
                      {typeof getBestResponse() === "string" ? (
                        <p>{getBestResponse()}</p>
                      ) : (
                        <p className="error">
                          {getBestResponse()?.message || "Error in response"}
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
