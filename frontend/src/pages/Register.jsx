import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, setAuthToken } from "../services/api";
import "../styles/Auth.css";



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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

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
    <div className={`auth-container ${theme}`}>
      <button className="auth-theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✨</div>
          <h1 className="auth-title">Promptiva</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                required
              />
            </div>
            {errors.username && <div className="error-message">{errors.username}</div>}
            {formData.username && (
              <div className="validation-rules">
                <div className="validation-rule">
                  <span className={`validation-icon ${formData.username.length >= 3 ? 'valid' : 'invalid'}`}>
                    {formData.username.length >= 3 ? "✓" : "✗"}
                  </span>
                  <span>At least 3 characters ({formData.username.length}/3)</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <div className="input-wrapper">
                <span className="input-icon">🔐</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
            {formData.password && (
              <div className="validation-rules">
                <div className="validation-rule">
                  <span className={`validation-icon ${formData.password.length >= 6 ? 'valid' : 'invalid'}`}>
                    {formData.password.length >= 6 ? "✓" : "✗"}
                  </span>
                  <span>At least 6 characters ({formData.password.length}/6)</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <div className="password-wrapper">
              <div className="input-wrapper">
                <span className="input-icon">🔐</span>
                <input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.passwordConfirm && (
              <div className="error-message">{errors.passwordConfirm}</div>
            )}
            {formData.password && formData.passwordConfirm && (
              <div className="validation-rules">
                <div className="validation-rule">
                  <span className={`validation-icon ${formData.password === formData.passwordConfirm ? 'valid' : 'invalid'}`}>
                    {formData.password === formData.passwordConfirm ? "✓" : "✗"}
                  </span>
                  <span>Passwords match</span>
                </div>
              </div>
            )}
          </div>

          {errors.submit && <div className="error-message">⚠️ {errors.submit}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
          <p>
            <Link to="/landing" className="auth-link">
              ← Back to landing
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
