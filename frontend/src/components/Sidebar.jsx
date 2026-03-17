import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken, getHistory, updateGeneration, deleteGeneration } from "../services/api";
import "../styles/Sidebar.css";

export default function Sidebar({ theme, onNewChat, currentChatId, onToggleTheme }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

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

  const handleRenameClick = (item) => {
    setEditingId(item.id);
    setEditingText(item.prompt);
    setContextMenuOpen(null);
  };

  const handleSaveRename = async (id) => {
    try {
      if (!editingText.trim()) {
        setEditingId(null);
        return;
      }
      await updateGeneration(id, editingText);
      const updatedHistory = history.map((item) =>
        item.id === id ? { ...item, prompt: editingText } : item
      );
      setHistory(updatedHistory);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to rename:", err);
      setEditingId(null);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteGeneration(id);
      setHistory(history.filter((item) => item.id !== id));
      setContextMenuOpen(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      setContextMenuOpen(null);
    }
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
                <div key={item.id} className="history-item-wrapper">
                  {editingId === item.id ? (
                    <div className="history-item-edit">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveRename(item.id)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveRename(item.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="edit-input"
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`history-item ${
                          currentChatId === item.id ? "active" : ""
                        }`}
                        onClick={() => onNewChat(item)}
                        title={item.prompt}
                      >
                        <span className="history-icon">💬</span>
                        <span className="history-text">
                          {truncateText(item.prompt, 25)}
                        </span>
                      </div>
                      <div className="history-menu-wrapper">
                        <button
                          className="history-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuOpen(contextMenuOpen === item.id ? null : item.id);
                          }}
                        >
                          ⋮
                        </button>
                        {contextMenuOpen === item.id && (
                          <div className="context-menu">
                            <button
                              className="context-menu-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameClick(item);
                              }}
                            >
                              ✏️ Rename
                            </button>
                            <button
                              className="context-menu-item delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(item.id);
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
        <button 
          className="theme-toggle-btn" 
          onClick={onToggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

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
