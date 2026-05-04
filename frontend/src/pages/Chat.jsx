import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateContent, getHistory, clearAuthToken } from "../services/api";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import QuoteDisplay from "../components/QuoteDisplay";
import "../styles/Chat.css";

const Chat = () => {
  // Wrapper function for backward compatibility
  return <ChatComponent />;
};

function ChatComponent() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const questionSequence = ['tone', 'length', 'audience', 'style'];

  const [answers, setAnswers] = useState({
    tone: "",
    length: "",
    audience: "",
    style: "",
    specifics: "",
  });

  const contentTypes = [
    { id: "blog", name: "📝 Blog", icon: "📝" },
    { id: "linkedin", name: "💼 LinkedIn", icon: "💼" },
    { id: "instagram", name: "📸 Instagram", icon: "📸" },
    { id: "twitter", name: "𝕏 Twitter", icon: "𝕏" },
    { id: "email", name: "✉️ Email", icon: "✉️" },
    { id: "ad", name: "📢 Ad Copy", icon: "📢" },
  ];

  const questionOptions = {
    tone: ["Professional", "Casual", "Friendly", "Humorous", "Inspirational"],
    length: ["Short (< 100 words)", "Medium (100-300 words)", "Long (300+ words)"],
    audience: ["B2B", "B2C", "Gen Z", "Professionals", "Students"],
    style: ["Storytelling", "Data-driven", "Persuasive", "Educational", "Creative"],
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

  const handleContentTypeSelect = (typeId) => {
    setSelectedContentType(typeId);
    setShowQuestions(true);
    setCurrentQuestionIndex(0);
    setAnswers({ tone: "", length: "", audience: "", style: "", specifics: "" });
  };

  const handleNextQuestion = (value) => {
    if (currentQuestionIndex < questionSequence.length) {
      const currentField = questionSequence[currentQuestionIndex];
      setAnswers({ ...answers, [currentField]: value });
      
      // Move to next question if not at the end
      if (currentQuestionIndex < questionSequence.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Show specifics field after answers
        setCurrentQuestionIndex(questionSequence.length);
      }
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questionSequence.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(questionSequence.length);
    }
  };

  const handleGenerateWithAnswers = async () => {
    if (!answers.specifics?.trim()) {
      setError("Please describe what you want to create.");
      return;
    }

    // Build context from answers
    const context = `
Content Type: ${selectedContentType}
Tone: ${answers.tone || "Not specified"}
Length: ${answers.length || "Not specified"}
Target Audience: ${answers.audience || "Not specified"}
Style: ${answers.style || "Not specified"}
Details: ${answers.specifics}
    `.trim();

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await generateContent(context, false);
      setResult(response);
      setCurrentChatId(response.id);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate content");
    } finally {
      setIsLoading(false);
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
      setShowQuestions(false);
      setAnswers({ tone: "", length: "", audience: "", style: "", specifics: "" });
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
    if (!result?.winner?.response) return "No response available";
    return result.winner.response;
  };

  const handleNavigateHome = () => {
    handleNewChat();
  };

  return (
    <div className={`chat-container ${theme}`}>
      <Sidebar 
        theme={theme} 
        onNewChat={handleNewChat} 
        currentChatId={currentChatId}
        onToggleTheme={toggleTheme}
      />

      <div className="chat-main">
        <div className="chat-header-top">
          <button className="home-btn" onClick={handleNavigateHome} title="Go to Home">
            ✨ Promptiva
          </button>
        </div>

        <div className="chat-content">
          {!result && !isLoading ? (
            // Initial State - Center Promptiva with Content Type Selection
            <div className="welcome-section">
              <div className="animated-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="floating-particle particle-1"></div>
                <div className="floating-particle particle-2"></div>
                <div className="floating-particle particle-3"></div>
              </div>

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
                    <p className="selection-label">Choose how you want to create content:</p>
                    <div className="content-type-grid">
                      {contentTypes.map((type, idx) => (
                        <div
                          key={type.id}
                          className="content-type-card"
                          onClick={() => handleContentTypeSelect(type.id)}
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <span className="type-icon">{type.icon}</span>
                          <p className="type-name">{type.name}</p>
                        </div>
                      ))}
                    </div>

                    <div className="prompt-section">
                      <p className="section-divider">Or ask directly:</p>
                      <div className="direct-prompt">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your prompt here... (Ctrl+Enter to generate)"
                          className="prompt-area"
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={isLoading || !prompt.trim()}
                          className="direct-generate-btn"
                        >
                          ✨ Generate
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Questions Form - Progressive
                  <div className="questions-form">
                    <button
                      className="back-btn"
                      onClick={() => {
                        setSelectedContentType(null);
                        setShowQuestions(false);
                        setCurrentQuestionIndex(0);
                      }}
                    >
                      ← Back to types
                    </button>
                    <p className="form-title">
                      {contentTypes.find((t) => t.id === selectedContentType)?.name || "Content"}
                    </p>
                    <p className="form-subtitle">Answer a few quick questions:</p>
                    <p className="question-counter">Question {Math.min(currentQuestionIndex + 1, questionSequence.length + 1)} of {questionSequence.length + 1}</p>

                    {/* Progressive Questions */}
                    <div className="progressive-questions">
                      {/* Tone - Question 1 */}
                      {currentQuestionIndex === 0 && (
                        <div className="question-group animated-question">
                          <label className="question-label">What tone should it have?</label>
                          <div className="options-grid">
                            {questionOptions.tone.map((option) => (
                              <button
                                key={option}
                                className={`option-btn ${answers.tone === option ? "active" : ""}`}
                                onClick={() => handleNextQuestion(option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                          <button className="skip-btn" onClick={handleSkipQuestion}>
                            ⏭️ Skip
                          </button>
                        </div>
                      )}

                      {/* Length - Question 2 */}
                      {currentQuestionIndex === 1 && (
                        <div className="question-group animated-question">
                          <label className="question-label">How long should it be?</label>
                          <div className="options-grid">
                            {questionOptions.length.map((option) => (
                              <button
                                key={option}
                                className={`option-btn ${answers.length === option ? "active" : ""}`}
                                onClick={() => handleNextQuestion(option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                          <button className="skip-btn" onClick={handleSkipQuestion}>
                            ⏭️ Skip
                          </button>
                        </div>
                      )}

                      {/* Audience - Question 3 */}
                      {currentQuestionIndex === 2 && (
                        <div className="question-group animated-question">
                          <label className="question-label">Who's your audience?</label>
                          <div className="options-grid">
                            {questionOptions.audience.map((option) => (
                              <button
                                key={option}
                                className={`option-btn ${answers.audience === option ? "active" : ""}`}
                                onClick={() => handleNextQuestion(option)}
                              >
                            {option}
                              </button>
                            ))}
                          </div>
                          <button className="skip-btn" onClick={handleSkipQuestion}>
                            ⏭️ Skip
                          </button>
                        </div>
                      )}

                    {/* Style - Question 4 */}
                      {currentQuestionIndex === 3 && (
                        <div className="question-group animated-question">
                          <label className="question-label">What's your preferred style?</label>
                          <div className="options-grid">
                            {questionOptions.style.map((option) => (
                              <button
                                key={option}
                                className={`option-btn ${answers.style === option ? "active" : ""}`}
                                onClick={() => handleNextQuestion(option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                          <button className="skip-btn" onClick={handleSkipQuestion}>
                            ⏭️ Skip
                          </button>
                        </div>
                      )}

                    {/* Specifics - Question 5 */}
                    {currentQuestionIndex === 4 && (
                    <div className="question-group animated-question full-width">
                      <label className="question-label">Tell us what you want to create:</label>
                      <textarea
                        value={answers.specifics}
                        onChange={(e) => setAnswers({ ...answers, specifics: e.target.value })}
                        placeholder="Be as specific as possible... (e.g., 'A blog post about 5 productivity tips for remote workers')"
                        className="specifics-input"
                      />
                      {error && <div className="error-message">{error}</div>}
                      <button
                        onClick={handleGenerateWithAnswers}
                        disabled={isLoading || !answers.specifics.trim()}
                        className="generate-btn-main"
                      >
                        {isLoading ? "✨ Generating..." : "✨ Create Content"}
                      </button>
                    </div>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Split Screen View - Shows immediately on loading
            <div className={`split-screen ${isLoading ? "loading" : ""}`}>
              {/* Left Side - Input & Controls */}
              <div className="split-left">
                <div className="input-section">
                  <div className="input-wrapper">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
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
      </div>
    </div>
  );
}

export default Chat;
