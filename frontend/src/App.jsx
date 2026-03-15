import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { isAuthenticated, getAuthToken } from "./services/api";

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/landing" replace />;
  }
  return children;
}

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  useEffect(() => {
    const token = getAuthToken();
    setIsAuth(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/landing"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
