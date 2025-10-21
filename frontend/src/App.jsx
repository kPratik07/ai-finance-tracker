import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { TransactionProvider } from "./context/TransactionContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { StatementUpload } from "./pages/StatementUpload";
import Transactions from "./pages/Transactions";
import { Footer } from "./components/common/Footer";

import "./styles/main.css";
import "./styles/enhanced-components.css";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status on route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <TransactionProvider>
      <div className="layout">
        {isLoggedIn && (
          <nav className="navbar">
            <div className="nav-content">
              <div className="nav-brand">
                <img src="/logo.svg" alt="AI Finance Tracker Logo" className="nav-logo" />
                <h1>AI Finance Tracker</h1>
              </div>
              <div className="nav-links">
                <Link to="/">Dashboard</Link>
                <Link to="/upload">Upload Statement</Link>
                <Link to="/transactions">Transactions</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </nav>
        )}
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <StatementUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </TransactionProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
