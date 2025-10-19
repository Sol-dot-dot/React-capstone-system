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
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import UserAnalytics from './components/analytics/UserAnalytics';
import BookAnalytics from './components/analytics/BookAnalytics';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import { SearchProvider } from './contexts/SearchContext';
import designSystem from './styles/designSystem';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
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
          <div className="flex h-screen bg-slate-50 relative">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            <Sidebar 
              isCollapsed={sidebarCollapsed}
              isMobile={isMobile}
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onLogout={handleLogout}
              user={user}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar 
                onToggleSidebar={toggleSidebar}
                onLogout={handleLogout}
                user={user}
                notifications={[]}
                isMobile={isMobile}
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
              path="/analytics" 
              element={
                isAuthenticated ? 
                <AnalyticsDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/analytics/users" 
              element={
                isAuthenticated ? 
                <UserAnalytics user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/analytics/books" 
              element={
                isAuthenticated ? 
                <BookAnalytics user={user} /> : 
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

      </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
