import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBook, 
  FiClipboard, 
  FiFileText, 
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import designSystem from '../styles/designSystem';

const Sidebar = ({ isCollapsed, onToggle, onLogout, user }) => {
  const location = useLocation();

  const navigationItems = [
    {
      path: '/enhanced-dashboard',
      label: 'Dashboard',
      icon: FiHome,
      description: 'Overview and statistics'
    },
    {
      path: '/users',
      label: 'User Management',
      icon: FiUsers,
      description: 'Manage library members'
    },
    {
      path: '/books',
      label: 'Book Management',
      icon: FiBook,
      description: 'Manage library books'
    },
    {
      path: '/borrowings',
      label: 'Borrowing Management',
      icon: FiClipboard,
      description: 'Track book borrowings'
    },
    {
      path: '/penalties',
      label: 'Penalty Management',
      icon: FiDollarSign,
      description: 'Manage overdue fines'
    },
    {
      path: '/activity-logs',
      label: 'Activity Logs',
      icon: FiFileText,
      description: 'System activity history'
    }
  ];

  const sidebarStyles = {
    sidebar: {
      width: isCollapsed ? designSystem.layout.sidebar.collapsedWidth : designSystem.layout.sidebar.width,
      height: '100vh',
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      borderRight: `1px solid ${designSystem.colors.semantic.border}`,
      boxShadow: designSystem.shadows.lg,
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: designSystem.zIndex.fixed,
      transition: 'width 0.3s ease-in-out',
      overflow: 'hidden',
    },
    header: {
      padding: designSystem.spacing[6],
      borderBottom: `1px solid ${designSystem.colors.semantic.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'space-between',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[3],
      textDecoration: 'none',
      color: designSystem.colors.semantic.text.primary,
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: designSystem.colors.primary[600],
      borderRadius: designSystem.borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: designSystem.colors.neutral.white,
      fontSize: designSystem.typography.fontSize.lg,
    },
    logoText: {
      fontSize: designSystem.typography.fontSize.lg,
      fontWeight: designSystem.typography.fontWeight.bold,
      color: designSystem.colors.semantic.text.primary,
      display: isCollapsed ? 'none' : 'block',
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: designSystem.spacing[2],
      borderRadius: designSystem.borderRadius.md,
      color: designSystem.colors.semantic.text.secondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
      },
    },
    navigation: {
      padding: designSystem.spacing[4],
      display: 'flex',
      flexDirection: 'column',
      gap: designSystem.spacing[1],
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
      borderRadius: designSystem.borderRadius.lg,
      textDecoration: 'none',
      color: designSystem.colors.semantic.text.secondary,
      transition: 'all 0.2s ease-in-out',
      position: 'relative',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
        color: designSystem.colors.semantic.text.primary,
      },
    },
    navItemActive: {
      backgroundColor: designSystem.colors.primary[50],
      color: designSystem.colors.primary[700],
      fontWeight: designSystem.typography.fontWeight.semibold,
    },
    navIcon: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    navLabel: {
      marginLeft: designSystem.spacing[3],
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: 'inherit',
      display: isCollapsed ? 'none' : 'block',
    },
    tooltip: {
      position: 'absolute',
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: designSystem.spacing[2],
      padding: `${designSystem.spacing[2]} ${designSystem.spacing[3]}`,
      backgroundColor: designSystem.colors.neutral.gray[900],
      color: designSystem.colors.neutral.white,
      borderRadius: designSystem.borderRadius.md,
      fontSize: designSystem.typography.fontSize.xs,
      whiteSpace: 'nowrap',
      opacity: 0,
      visibility: 'hidden',
      transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
      zIndex: designSystem.zIndex.tooltip,
      '&::before': {
        content: '""',
        position: 'absolute',
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        border: `4px solid transparent`,
        borderRightColor: designSystem.colors.neutral.gray[900],
      },
    },
    tooltipVisible: {
      opacity: 1,
      visibility: 'visible',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: designSystem.spacing[4],
      borderTop: `1px solid ${designSystem.colors.semantic.border}`,
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[3],
      marginBottom: designSystem.spacing[4],
      padding: designSystem.spacing[3],
      borderRadius: designSystem.borderRadius.lg,
      backgroundColor: designSystem.colors.neutral.gray[50],
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: designSystem.borderRadius.full,
      backgroundColor: designSystem.colors.primary[600],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: designSystem.colors.neutral.white,
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.semibold,
    },
    userDetails: {
      display: isCollapsed ? 'none' : 'block',
      flex: 1,
    },
    userName: {
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.semibold,
      color: designSystem.colors.semantic.text.primary,
      margin: 0,
    },
    userRole: {
      fontSize: designSystem.typography.fontSize.xs,
      color: designSystem.colors.semantic.text.tertiary,
      margin: 0,
    },
    logoutButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[3],
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
      background: 'none',
      border: 'none',
      borderRadius: designSystem.borderRadius.lg,
      color: designSystem.colors.accent.error,
      cursor: 'pointer',
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.medium,
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
      },
    },
  };

  return (
    <aside style={sidebarStyles.sidebar}>
      {/* Header */}
      <div style={sidebarStyles.header}>
        <Link to="/enhanced-dashboard" style={sidebarStyles.logo}>
          <div style={sidebarStyles.logoIcon}>
            <FiBook />
          </div>
          <span style={sidebarStyles.logoText}>Library Admin</span>
        </Link>
        {!isCollapsed && (
          <button
            style={sidebarStyles.toggleButton}
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <FiMenu />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={sidebarStyles.navigation}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...sidebarStyles.navItem,
                ...(isActive ? sidebarStyles.navItemActive : {}),
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <div style={sidebarStyles.navIcon}>
                <Icon />
              </div>
              <span style={sidebarStyles.navLabel}>{item.label}</span>
              {isCollapsed && (
                <div
                  style={{
                    ...sidebarStyles.tooltip,
                    ...sidebarStyles.tooltipVisible,
                  }}
                >
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={sidebarStyles.footer}>
        {/* User Info */}
        <div style={sidebarStyles.userInfo}>
          <div style={sidebarStyles.userAvatar}>
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={sidebarStyles.userDetails}>
            <p style={sidebarStyles.userName}>{user?.username || 'Admin'}</p>
            <p style={sidebarStyles.userRole}>Administrator</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          style={sidebarStyles.logoutButton}
          onClick={onLogout}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <FiLogOut />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
