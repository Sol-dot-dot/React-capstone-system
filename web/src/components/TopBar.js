import React, { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiSettings, FiMenu, FiLogOut } from 'react-icons/fi';
import designSystem from '../styles/designSystem';

const TopBar = ({ onToggleSidebar, user, notifications = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const topBarStyles = {
    topBar: {
      height: designSystem.layout.header.height,
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      borderBottom: `1px solid ${designSystem.colors.semantic.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${designSystem.spacing[6]}`,
      position: 'sticky',
      top: 0,
      zIndex: designSystem.zIndex.sticky,
      boxShadow: designSystem.shadows.sm,
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[4],
    },
    menuButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      background: 'none',
      border: 'none',
      borderRadius: designSystem.borderRadius.lg,
      cursor: 'pointer',
      color: designSystem.colors.semantic.text.secondary,
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
      },
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    searchInput: {
      width: '400px',
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]} ${designSystem.spacing[3]} ${designSystem.spacing[12]}`,
      border: `1px solid ${designSystem.colors.neutral.gray[300]}`,
      borderRadius: designSystem.borderRadius.lg,
      fontSize: designSystem.typography.fontSize.sm,
      backgroundColor: designSystem.colors.neutral.gray[50],
      transition: 'all 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: designSystem.colors.primary[500],
        backgroundColor: designSystem.colors.neutral.white,
        boxShadow: `0 0 0 3px ${designSystem.colors.primary[100]}`,
      },
      '&::placeholder': {
        color: designSystem.colors.neutral.gray[400],
      },
    },
    searchIcon: {
      position: 'absolute',
      left: designSystem.spacing[4],
      color: designSystem.colors.neutral.gray[400],
      width: '20px',
      height: '20px',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[4],
    },
    iconButton: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      background: 'none',
      border: 'none',
      borderRadius: designSystem.borderRadius.lg,
      cursor: 'pointer',
      color: designSystem.colors.semantic.text.secondary,
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
      },
    },
    notificationBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '8px',
      height: '8px',
      backgroundColor: designSystem.colors.accent.error,
      borderRadius: designSystem.borderRadius.full,
    },
    userMenu: {
      position: 'relative',
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[2],
      padding: `${designSystem.spacing[2]} ${designSystem.spacing[3]}`,
      background: 'none',
      border: 'none',
      borderRadius: designSystem.borderRadius.lg,
      cursor: 'pointer',
      color: designSystem.colors.semantic.text.primary,
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
      },
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: designSystem.borderRadius.full,
      backgroundColor: designSystem.colors.primary[600],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: designSystem.colors.neutral.white,
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.semibold,
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
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
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: designSystem.spacing[2],
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      border: `1px solid ${designSystem.colors.semantic.border}`,
      borderRadius: designSystem.borderRadius.lg,
      boxShadow: designSystem.shadows.lg,
      minWidth: '200px',
      zIndex: designSystem.zIndex.dropdown,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: designSystem.spacing[3],
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
      color: designSystem.colors.semantic.text.primary,
      textDecoration: 'none',
      fontSize: designSystem.typography.fontSize.sm,
      transition: 'background-color 0.2s ease-in-out',
      borderBottom: `1px solid ${designSystem.colors.semantic.borderLight}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[50],
      },
    },
    notificationsDropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: designSystem.spacing[2],
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      border: `1px solid ${designSystem.colors.semantic.border}`,
      borderRadius: designSystem.borderRadius.lg,
      boxShadow: designSystem.shadows.lg,
      width: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: designSystem.zIndex.dropdown,
    },
    notificationHeader: {
      padding: `${designSystem.spacing[4]} ${designSystem.spacing[4]} ${designSystem.spacing[3]}`,
      borderBottom: `1px solid ${designSystem.colors.semantic.border}`,
    },
    notificationTitle: {
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.semibold,
      color: designSystem.colors.semantic.text.primary,
      margin: 0,
    },
    notificationItem: {
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
      borderBottom: `1px solid ${designSystem.colors.semantic.borderLight}`,
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    notificationText: {
      fontSize: designSystem.typography.fontSize.sm,
      color: designSystem.colors.semantic.text.primary,
      margin: 0,
      marginBottom: designSystem.spacing[1],
    },
    notificationTime: {
      fontSize: designSystem.typography.fontSize.xs,
      color: designSystem.colors.semantic.text.tertiary,
      margin: 0,
    },
    emptyState: {
      padding: designSystem.spacing[6],
      textAlign: 'center',
      color: designSystem.colors.semantic.text.tertiary,
      fontSize: designSystem.typography.fontSize.sm,
    },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header style={topBarStyles.topBar}>
      {/* Left Section */}
      <div style={topBarStyles.leftSection}>
        <button
          style={topBarStyles.menuButton}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} style={topBarStyles.searchContainer}>
          <FiSearch style={topBarStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search books, users, or activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={topBarStyles.searchInput}
            aria-label="Search"
          />
        </form>
      </div>

      {/* Right Section */}
      <div style={topBarStyles.rightSection}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            style={topBarStyles.iconButton}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <FiBell />
            {notifications.length > 0 && (
              <div style={topBarStyles.notificationBadge} />
            )}
          </button>

          {showNotifications && (
            <div style={topBarStyles.notificationsDropdown}>
              <div style={topBarStyles.notificationHeader}>
                <h3 style={topBarStyles.notificationTitle}>Notifications</h3>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} style={topBarStyles.notificationItem}>
                    <p style={topBarStyles.notificationText}>
                      {notification.message}
                    </p>
                    <p style={topBarStyles.notificationTime}>
                      {notification.time}
                    </p>
                  </div>
                ))
              ) : (
                <div style={topBarStyles.emptyState}>
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={topBarStyles.userMenu}>
          <button
            style={topBarStyles.userButton}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div style={topBarStyles.userAvatar}>
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={topBarStyles.userInfo}>
              <p style={topBarStyles.userName}>{user?.username || 'Admin'}</p>
              <p style={topBarStyles.userRole}>Administrator</p>
            </div>
          </button>

          {showUserMenu && (
            <div style={topBarStyles.dropdown}>
              <a href="#" style={topBarStyles.dropdownItem}>
                <FiUser />
                Profile
              </a>
              <a href="#" style={topBarStyles.dropdownItem}>
                <FiSettings />
                Settings
              </a>
              <a href="#" style={topBarStyles.dropdownItem}>
                <FiLogOut />
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
