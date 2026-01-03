import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  ArrowLeft,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FolderOpen,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';

const ModernSidebar = ({ isCollapsed, isMobile, isOpen, onToggle, onLogout, user }) => {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/enhanced-dashboard' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: BookOpen, label: 'Book Management', path: '/books' },
    { icon: ClipboardList, label: 'Borrowing Management', path: '/borrowings' },
    { icon: ArrowLeft, label: 'Returning Management', path: '/returning' },
    { icon: DollarSign, label: 'Penalty Management', path: '/penalties' },
    { icon: GraduationCap, label: 'Clearance Requirements', path: '/clearance-requirements' },
  ];

  const recordsItems = [
    { icon: FolderOpen, label: 'Student Library Records', path: '/student-records' },
  ];

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
    mobile: { x: 0 },
    mobileHidden: { x: -280 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <motion.aside
        variants={sidebarVariants}
        animate={
          isMobile
            ? (isOpen ? "mobile" : "mobileHidden")
            : (isCollapsed ? "collapsed" : "expanded")
        }
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-lg z-50
          ${isMobile ? 'w-80' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex items-center justify-center">
                      <img
                        src="/smc-logo.png"
                        alt="SMC Logo"
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">SMC Library System</h1>
                      <p className="text-xs text-slate-500">St. Michael's College</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed Logo */}
              <AnimatePresence>
                {isCollapsed && !isMobile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center"
                  >
                    <div className="flex items-center justify-center">
                      <img
                        src="/smc-logo.png"
                        alt="SMC Logo"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-scroll">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={item.path}>
                    <motion.div
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                      <AnimatePresence>
                        {(!isCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (!isCollapsed || isMobile) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Records Section */}
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Records
                    </h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {recordsItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: (menuItems.length + index) * 0.1 }}
                >
                  <Link to={item.path}>
                    <motion.div
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                      <AnimatePresence>
                        {(!isCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (!isCollapsed || isMobile) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-slate-200">
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleLogoutClick}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed Logout */}
            <AnimatePresence>
              {isCollapsed && !isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={handleLogoutCancel}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-[90%] max-w-sm sm:max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Confirm Logout</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-6">
                  Are you sure you want to logout? You will need to login again to access the system.
                </p>
                <div className="flex flex-col-reverse sm:flex-row sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={handleLogoutCancel}
                    className="w-full sm:w-auto px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLogoutConfirm}
                    className="w-full sm:w-auto px-4 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModernSidebar;
