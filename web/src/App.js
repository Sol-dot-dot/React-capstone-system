import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/dashboard/Dashboard';
import UserManagement from './components/management/UserManagement';
import ActivityLogs from './components/monitoring/ActivityLogs';
import BookManagement from './components/management/BookManagement';
import BorrowingManagement from './components/management/BorrowingManagement';
import ReturningManagement from './components/management/ReturningManagement';
import PenaltyManagement from './components/management/PenaltyManagement';
import MonitoringDashboard from './components/monitoring/MonitoringDashboard';
import ClearanceRequirements from './components/management/ClearanceRequirements';
import ChatbotWidget from './components/ui/ChatbotWidget';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import { SearchProvider } from './contexts/SearchContext';
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
    <SearchProvider>
      <Router>
      <div style={appStyles.app}>
        {isAuthenticated ? (
          <div className="flex h-screen bg-slate-50">
            <Sidebar 
              isCollapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              onLogout={handleLogout}
              user={user}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar 
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
                <LoginForm onLogin={handleLogin} />
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
                <Dashboard user={user} /> : 
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
              path="/returning" 
              element={
                isAuthenticated ? 
                <ReturningManagement user={user} /> : 
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
              path="/clearance-requirements" 
              element={
                isAuthenticated ? 
                <ClearanceRequirements user={user} /> : 
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
                element={<LoginForm onLogin={handleLogin} />} 
              />
              <Route 
                path="*" 
                element={<Navigate to="/login" replace />} 
              />
            </Routes>
          </div>
        )}

        {/* Floating Chatbot Button */}
        {isAuthenticated && !isChatbotVisible && (
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.38 14.99 3.05 16.28L2 22L7.72 20.95C9.01 21.62 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2ZM12 20C10.74 20 9.54 19.78 8.44 19.38L8 19.15L5.2 20.05L6.1 17.25L5.87 16.81C5.47 15.71 5.25 14.51 5.25 13.25C5.25 8.13 9.13 4.25 14.25 4.25S23.25 8.13 23.25 13.25 19.37 20 14.25 20H12Z" fill="currentColor"/>
              <circle cx="9" cy="12" r="1" fill="currentColor"/>
              <circle cx="15" cy="12" r="1" fill="currentColor"/>
            </svg>
          </button>
        )}

        {/* Chatbot Widget */}
        <ChatbotWidget 
          isVisible={isChatbotVisible} 
          onClose={() => setIsChatbotVisible(false)} 
        />
      </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
