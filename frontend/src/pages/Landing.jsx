import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/api";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [step, setStep] = useState("question"); // question, answer, login
  const [showAns, setShowAns] = useState(false);

  const funnyQuestions = [
    {
      q: "If you could debug one thing in this universe, what would it be?",
      answers: [
        'The "why" button that appears when something works',
        "Why cats always knock things off tables",
        "The arrow keys in the shape of an actual arrow",
        "Gravity glitches on Mondays",
      ],
    },
    {
      q: "What would you rename 'Artificial Intelligence' to?",
      answers: [
        "Confident Guessing",
        "Silicon Dreams",
        "Magical Pattern Recognition",
        "Expensive Autocorrect",
      ],
    },
    {
      q: "If AI could have a superpower, what should it be?",
      answers: [
        "Making coffee appear out of nowhere",
        "Understanding sarcasm perfectly",
        "Never needing to install updates",
        "Read humans' minds (but only the nice thoughts)",
      ],
    },
    {
      q: "What's the most important thing an AI should never do?",
      answers: [
        "Delete your project 5 minutes before delivery",
        "Suggest Comic Sans as the default font",
        "Say 'I'm sorry Dave, I'm afraid I can't do that'",
        "Ask to borrow money",
      ],
    },
    {
      q: "If you had to teach AI your worst habit, what would it be?",
      answers: [
        "Snoozing the alarm 5 times before waking up",
        "Googling symptoms on WebMD",
        "Starting projects but never finishing them",
        'Saying "I\'ll start tomorrow"',
      ],
    },
  ];

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    } else {
      const randomQ = funnyQuestions[Math.floor(Math.random() * funnyQuestions.length)];
      setQuestion(randomQ);
    }
  }, []);

  const handleAnswerSelect = (selected) => {
    setAnswer(selected);
    setShowAns(true);
    setTimeout(() => {
      setStep("login");
    }, 1500);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    localStorage.setItem("theme", theme === "dark" ? "light" : "dark");
  };

  if (!question) return null;

  return (
    <div className={`landing-page ${theme}`}>
      <div className="landing-container">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="landing-content">
          {step === "question" ? (
            <div className="question-section">
              <div className="question-bubble">
                <h2>{question.q}</h2>
              </div>

              <div className="answers-grid">
                {question.answers.map((answer, idx) => (
                  <button
                    key={idx}
                    className="answer-btn"
                    onClick={() => handleAnswerSelect(answer)}
                  >
                    {answer}
                  </button>
                ))}
              </div>

              <p className="question-hint">Pick one, no judgment! 😉</p>
            </div>
          ) : step === "answer" ? (
            <div className="answer-section">
              <div className="answer-display">
                <p className="chosen-q">Your answer:</p>
                <p className="chosen-ans">{answer}</p>
                <p className="answer-reaction">Interesting choice! 🤔✨</p>
              </div>
            </div>
          ) : (
            <div className="login-section">
              <div className="login-header">
                <h1 className="promptiva-title">
                  <span className="prompt">Promptiva</span>
                </h1>
                <p className="subtitle">
                  Your AI Content Creation Assistant
                </p>
              </div>

              <div className="login-buttons">
                <button
                  className="auth-btn login-btn"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
                <button
                  className="auth-btn signup-btn"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </button>
              </div>

              <div className="features-preview">
                <div className="feature">
                  <span className="feature-icon">✨</span>
                  <span>Multi-Model Generation</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💬</span>
                  <span>Chat History</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎨</span>
                  <span>Beautiful Interface</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
