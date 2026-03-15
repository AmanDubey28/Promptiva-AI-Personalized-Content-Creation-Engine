import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, setAuthToken } from "../services/api";

const REGISTER_STYLES = {
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
    marginBottom: "18px",
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
  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#888",
  },
  footerLink: {
    marginLeft: "5px",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#888",
    fontSize: "16px",
    userSelect: "none",
    background: "none",
    border: "none",
    padding: "4px 8px",
    display: "flex",
    alignItems: "center",
  },
  validationRules: {
    fontSize: "12px",
    color: "#999",
    marginTop: "6px",
    padding: "8px",
    background: "rgba(255, 149, 0, 0.1)",
    borderLeft: "2px solid #FF9500",
    borderRadius: "4px",
  },
  validationRule: {
    display: "flex",
    alignItems: "center",
    marginBottom: "4px",
    gap: "6px",
  },
  validationIcon: {
    fontSize: "12px",
  },
  validationValid: {
    color: "#4ade80",
  },
  validationInvalid: {
    color: "#ff6b6b",
  },
};

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await register(
        formData.email,
        formData.username,
        formData.password,
        formData.passwordConfirm
      );
      setAuthToken(response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      let errorMsg = "Registration failed";
      
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={REGISTER_STYLES.container}>
      <div style={REGISTER_STYLES.card}>
        <div style={REGISTER_STYLES.header}>
          <div style={REGISTER_STYLES.title}>Promptiva</div>
          <div style={REGISTER_STYLES.subtitle}>Create Your Account</div>
        </div>

        <form onSubmit={handleRegister}>
          <div style={REGISTER_STYLES.formGroup}>
            <label style={REGISTER_STYLES.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...REGISTER_STYLES.input,
                ...(focusedInput === "email" ? REGISTER_STYLES.inputFocus : {}),
              }}
              placeholder="your@email.com"
            />
            {errors.email && (
              <div style={REGISTER_STYLES.errorMessage}>{errors.email}</div>
            )}
          </div>

          <div style={REGISTER_STYLES.formGroup}>
            <label style={REGISTER_STYLES.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedInput("username")}
              onBlur={() => setFocusedInput(null)}
              style={{
                ...REGISTER_STYLES.input,
                ...(focusedInput === "username" ? REGISTER_STYLES.inputFocus : {}),
              }}
              placeholder="your_username"
            />
            {errors.username && (
              <div style={REGISTER_STYLES.errorMessage}>{errors.username}</div>
            )}
            {formData.username && (
              <div style={REGISTER_STYLES.validationRules}>
                <div style={REGISTER_STYLES.validationRule}>
                  <span style={{...REGISTER_STYLES.validationIcon, ...(formData.username.length >= 3 ? REGISTER_STYLES.validationValid : REGISTER_STYLES.validationInvalid)}}>
                    {formData.username.length >= 3 ? "✓" : "✗"}
                  </span>
                  <span>At least 3 characters ({formData.username.length}/3)</span>
                </div>
              </div>
            )}
          </div>

          <div style={REGISTER_STYLES.formGroup}>
            <label style={REGISTER_STYLES.label}>Password</label>
            <div style={REGISTER_STYLES.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...REGISTER_STYLES.input,
                  paddingRight: "40px",
                  ...(focusedInput === "password" ? REGISTER_STYLES.inputFocus : {}),
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                style={REGISTER_STYLES.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <div style={REGISTER_STYLES.errorMessage}>{errors.password}</div>
            )}
            {formData.password && (
              <div style={REGISTER_STYLES.validationRules}>
                <div style={REGISTER_STYLES.validationRule}>
                  <span style={{...REGISTER_STYLES.validationIcon, ...(formData.password.length >= 6 ? REGISTER_STYLES.validationValid : REGISTER_STYLES.validationInvalid)}}>
                    {formData.password.length >= 6 ? "✓" : "✗"}
                  </span>
                  <span>At least 6 characters ({formData.password.length}/6)</span>
                </div>
              </div>
            )}
          </div>

          <div style={REGISTER_STYLES.formGroup}>
            <label style={REGISTER_STYLES.label}>Confirm Password</label>
            <div style={REGISTER_STYLES.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onFocus={() => setFocusedInput("passwordConfirm")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...REGISTER_STYLES.input,
                  paddingRight: "40px",
                  ...(focusedInput === "passwordConfirm"
                    ? REGISTER_STYLES.inputFocus
                    : {}),
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                style={REGISTER_STYLES.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.passwordConfirm && (
              <div style={REGISTER_STYLES.errorMessage}>
                {errors.passwordConfirm}
              </div>
            )}
            {formData.password && formData.passwordConfirm && (
              <div style={REGISTER_STYLES.validationRules}>
                <div style={REGISTER_STYLES.validationRule}>
                  <span style={{...REGISTER_STYLES.validationIcon, ...(formData.password === formData.passwordConfirm ? REGISTER_STYLES.validationValid : REGISTER_STYLES.validationInvalid)}}>
                    {formData.password === formData.passwordConfirm ? "✓" : "✗"}
                  </span>
                  <span>Passwords match</span>
                </div>
              </div>
            )}
          </div>

          {errors.submit && (
            <div style={REGISTER_STYLES.errorMessage}>⚠️ {errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...REGISTER_STYLES.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) Object.assign(e.target.style, REGISTER_STYLES.buttonHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "none";
              e.target.style.boxShadow = "none";
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={REGISTER_STYLES.footer}>
          Already have an account?
          <Link
            to="/login"
            style={REGISTER_STYLES.link}
            onMouseEnter={(e) =>
              Object.assign(e.target.style, REGISTER_STYLES.linkHover)
            }
            onMouseLeave={(e) => (e.target.style.color = "#FF9500")}
          >
            <span style={REGISTER_STYLES.footerLink}>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
