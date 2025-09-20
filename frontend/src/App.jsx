import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { TransactionProvider } from "./context/TransactionContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { StatementUpload } from "./pages/StatementUpload";
import Transactions from "./pages/Transactions";

import "./styles/main.css";

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Router>
      <TransactionProvider>
        <div className="layout">
          {isLoggedIn && (
            <nav className="navbar">
              <div className="nav-content">
                <h1 className="nav-brand">AI Finance Tracker</h1>
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
        </div>
      </TransactionProvider>
    </Router>
  );
}

export default App;
