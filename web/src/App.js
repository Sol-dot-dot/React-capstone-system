import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EnhancedDashboard from './components/EnhancedDashboard';
import ModernDashboard from './components/ModernDashboard';
import UserManagement from './components/UserManagement';
import ModernUserManagement from './components/ModernUserManagement';
import ActivityLogs from './components/ActivityLogs';
import ModernActivityLogs from './components/ModernActivityLogs';
import BookManagement from './components/BookManagement';
import ModernBookManagement from './components/ModernBookManagement';
import BorrowingManagement from './components/BorrowingManagement';
import ModernBorrowingManagement from './components/ModernBorrowingManagement';
import ModernReturningManagement from './components/ModernReturningManagement';
import PenaltyManagement from './components/PenaltyManagement';
import ModernPenaltyManagement from './components/ModernPenaltyManagement';
import MonitoringDashboard from './components/MonitoringDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import ModernChatbotWidget from './components/ModernChatbotWidget';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ModernSidebar from './components/ModernSidebar';
import ModernTopBar from './components/ModernTopBar';
import designSystem from './styles/designSystem';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const appStyles = {
    app: {
      minHeight: '100vh',
      backgroundColor: designSystem.colors.semantic.background,
      fontFamily: designSystem.typography.fontFamily.sans.join(', '),
    },
    layout: {
      display: 'flex',
      minHeight: '100vh',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginLeft: sidebarCollapsed ? designSystem.layout.sidebar.collapsedWidth : designSystem.layout.sidebar.width,
      transition: 'margin-left 0.3s ease-in-out',
    },
    content: {
      flex: 1,
      padding: designSystem.spacing[6],
      maxWidth: designSystem.layout.content.maxWidth,
      margin: '0 auto',
      width: '100%',
    },
    loginContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: designSystem.colors.semantic.background,
    },
  };

  return (
    <Router>
      <div style={appStyles.app}>
        {isAuthenticated ? (
          <div className="flex h-screen bg-slate-50">
            <ModernSidebar 
              isCollapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              onLogout={handleLogout}
              user={user}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <ModernTopBar 
                onToggleSidebar={toggleSidebar}
                user={user}
                notifications={[]}
              />
              <main className="flex-1 overflow-auto">
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
                <ModernDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/users" 
              element={
                isAuthenticated ? 
                <ModernUserManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/books" 
              element={
                isAuthenticated ? 
                <ModernBookManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/activity-logs" 
              element={
                isAuthenticated ? 
                <ModernActivityLogs user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/borrowings" 
              element={
                isAuthenticated ? 
                <ModernBorrowingManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/returning" 
              element={
                isAuthenticated ? 
                <ModernReturningManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/penalties" 
              element={
                isAuthenticated ? 
                <ModernPenaltyManagement user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/monitoring" 
              element={
                isAuthenticated ? 
                <MonitoringDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/enhanced-dashboard" : "/login"} />} 
            />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <div style={appStyles.loginContainer}>
            <Routes>
              <Route 
                path="/login" 
                element={<Login onLogin={handleLogin} />} 
              />
              <Route 
                path="*" 
                element={<Navigate to="/login" replace />} 
              />
            </Routes>
          </div>
        )}

        {/* Floating Chatbot Button */}
        {isAuthenticated && (
          <button 
            className="floating-chat-button"
            onClick={() => setIsChatbotVisible(true)}
            title="Ask AI Assistant"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: designSystem.colors.primary[600],
              color: designSystem.colors.neutral.white,
              border: 'none',
              cursor: 'pointer',
              boxShadow: designSystem.shadows.lg,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: designSystem.zIndex.fixed,
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = designSystem.colors.primary[700];
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = designSystem.colors.primary[600];
            }}
          >
            💬
          </button>
        )}

        {/* Modern Chatbot Widget */}
        <ModernChatbotWidget 
          isVisible={isChatbotVisible} 
          onClose={() => setIsChatbotVisible(false)} 
        />
      </div>
    </Router>
  );
}

export default App;
