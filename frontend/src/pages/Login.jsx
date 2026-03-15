import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, setAuthToken } from "../services/api";

const LOGIN_STYLES = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #080808 0%, #0f0f0f 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#E8E3DA",
  },
  card: {
    background: "rgba(15, 15, 15, 0.8)",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(10px)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #FF9500, #FF6B35)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#E8E3DA",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px",
    background: "#080808",
    border: "1px solid #1e1e1e",
    borderRadius: "6px",
    color: "#E8E3DA",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#FF9500",
    outline: "none",
    boxShadow: "0 0 8px rgba(255, 149, 0, 0.2)",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #FF9500, #FF6B35)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    letterSpacing: "0.5px",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 16px rgba(255, 149, 0, 0.3)",
  },
  link: {
    color: "#FF9500",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.3s ease",
  },
  linkHover: {
    color: "#FF6B35",
  },
  errorMessage: {
    color: "#ff6b6b",
    fontSize: "13px",
    marginTop: "8px",
  },
  successMessage: {
    color: "#51cf66",
    fontSize: "13px",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#888",
  },
  footerLink: {
    marginLeft: "5px",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      setAuthToken(response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={LOGIN_STYLES.container}>
      <div style={LOGIN_STYLES.card}>
        <div style={LOGIN_STYLES.header}>
          <div style={LOGIN_STYLES.title}>Promptiva</div>
          <div style={LOGIN_STYLES.subtitle}>
            AI Personal Content Creation Engine
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={LOGIN_STYLES.formGroup}>
            <label style={LOGIN_STYLES.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...LOGIN_STYLES.input,
                ...(focusedInput === "email" ? LOGIN_STYLES.inputFocus : {}),
              }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={LOGIN_STYLES.formGroup}>
            <label style={LOGIN_STYLES.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...LOGIN_STYLES.input,
                ...(focusedInput === "password" ? LOGIN_STYLES.inputFocus : {}),
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div style={LOGIN_STYLES.errorMessage}>⚠️ {error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...LOGIN_STYLES.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) Object.assign(e.target.style, LOGIN_STYLES.buttonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "none";
              e.target.style.boxShadow = "none";
            }}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div style={LOGIN_STYLES.footer}>
          Don't have an account?
          <Link
            to="/register"
            style={LOGIN_STYLES.link}
            onMouseEnter={(e) =>
              Object.assign(e.target.style, LOGIN_STYLES.linkHover)
            }
            onMouseLeave={(e) => (e.target.style.color = "#FF9500")}
          >
            <span style={LOGIN_STYLES.footerLink}>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
