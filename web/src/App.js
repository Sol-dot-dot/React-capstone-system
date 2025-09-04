import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import EnhancedDashboard from './components/EnhancedDashboard';
import UserManagement from './components/UserManagement';
import ActivityLogs from './components/ActivityLogs';
import BookManagement from './components/BookManagement';
import BorrowingManagement from './components/BorrowingManagement';
import PenaltyManagement from './components/PenaltyManagement';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <nav className="navbar">
            <div className="container">
              <h1>Capstone System - Admin Panel</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <Link to="/enhanced-dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                    Admin Dashboard
                  </Link>
                  <Link to="/users" style={{ color: 'white', textDecoration: 'none' }}>
                    User Management
                  </Link>
                  <Link to="/books" style={{ color: 'white', textDecoration: 'none' }}>
                    Book Management
                  </Link>
                  <Link to="/activity-logs" style={{ color: 'white', textDecoration: 'none' }}>
                    Activity Logs
                  </Link>
                  <Link to="/borrowings" style={{ color: 'white', textDecoration: 'none' }}>
                    Borrowing Management
                  </Link>
                  <Link to="/penalties" style={{ color: 'white', textDecoration: 'none' }}>
                    Penalty Management
                  </Link>
                </div>
                <div>
                  <span>Welcome, {user?.username}</span>
                  <button onClick={handleLogout} style={{ marginLeft: '15px' }}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}
        
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/enhanced-dashboard" /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Navigate to="/enhanced-dashboard" /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/enhanced-dashboard" 
              element={
                isAuthenticated ? 
                <EnhancedDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/users" 
              element={
                isAuthenticated ? 
                <UserManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/books" 
              element={
                isAuthenticated ? 
                <BookManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/activity-logs" 
              element={
                isAuthenticated ? 
                <ActivityLogs user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/borrowings" 
              element={
                isAuthenticated ? 
                <BorrowingManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/penalties" 
              element={
                isAuthenticated ? 
                <PenaltyManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/enhanced-dashboard" : "/login"} />} 
            />
          </Routes>
        </div>

        {/* Floating Chatbot Button */}
        {isAuthenticated && (
          <button 
            className="floating-chat-button"
            onClick={() => setIsChatbotVisible(true)}
            title="Ask AI Assistant"
          >
            🤖
          </button>
        )}

        {/* Chatbot Widget */}
        <ChatbotWidget 
          isVisible={isChatbotVisible} 
          onClose={() => setIsChatbotVisible(false)} 
        />
      </div>
    </Router>
  );
}

export default App;
