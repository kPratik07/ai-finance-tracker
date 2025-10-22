import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { TransactionProvider } from "./context/TransactionContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Landing } from "./pages/Landing";
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

  // Hide navbar on auth pages if needed
  const hideNavbar = false;

  return (
    <TransactionProvider>
      <div className="layout">
        {!hideNavbar && (
          <nav className="navbar">
            <div className="nav-content">
              <div className="nav-brand">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h1>💰 AI Finance Tracker</h1>
                </Link>
              </div>
              {isLoggedIn ? (
                <div className="nav-links">
                  <Link 
                    to="/dashboard" 
                    className={location.pathname === '/dashboard' ? 'active' : ''}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/upload" 
                    className={location.pathname === '/upload' ? 'active' : ''}
                  >
                    Upload Statement
                  </Link>
                  <Link 
                    to="/transactions" 
                    className={location.pathname === '/transactions' ? 'active' : ''}
                  >
                    Transactions
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="nav-links">
                  {location.pathname === '/login' ? (
                    <Link to="/register" className="nav-link-btn btn-primary">Sign Up</Link>
                  ) : location.pathname === '/register' ? (
                    <Link to="/login" className="nav-link-btn">Login</Link>
                  ) : (
                    <>
                      <Link to="/login" className="nav-link-btn">Login</Link>
                      <Link to="/register" className="nav-link-btn btn-primary">Sign Up</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        )}
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={isLoggedIn ? <Dashboard /> : <Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
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
