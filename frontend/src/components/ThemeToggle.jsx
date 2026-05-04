import "../styles/ThemeToggle.css";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button className={`theme-toggle ${theme}`} onClick={onToggle} title="Toggle theme">
      <span className="toggle-sun">☀️</span>
      <span className="toggle-moon">🌙</span>
      <div className="toggle-slider"></div>
    </button>
  );
}
