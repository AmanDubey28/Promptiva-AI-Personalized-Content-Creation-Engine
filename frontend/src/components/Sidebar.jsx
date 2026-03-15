import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken, getHistory } from "../services/api";
import "../styles/Sidebar.css";

export default function Sidebar({ theme, onNewChat, currentChatId }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchHistory();
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    navigate("/login");
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <div className={`sidebar ${theme} ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="logo-section">
            <h2 className="logo">
              <span className="logo-icon">✨</span>
              <span>Promptiva</span>
            </h2>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* New Chat */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <span className="icon">+ </span>
        {!isCollapsed && <span>New Chat</span>}
      </button>

      {/* History Section */}
      {!isCollapsed && (
        <>
          <div className="history-header">
            <h3>History</h3>
            <button
              className="refresh-btn"
              onClick={fetchHistory}
              title="Refresh"
            >
              🔄
            </button>
          </div>

          {history.length > 0 ? (
            <div className="history-list">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`history-item ${
                    currentChatId === item.id ? "active" : ""
                  }`}
                  onClick={() => onNewChat(item)}
                  title={item.prompt}
                >
                  <span className="history-icon">💬</span>
                  <span className="history-text">
                    {truncateText(item.prompt, 30)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history">No history yet. Start chatting!</p>
          )}
        </>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <p className="username">{user.username}</p>
              <p className="email">{user.email}</p>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          <span className="icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
