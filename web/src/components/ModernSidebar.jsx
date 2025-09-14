import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  ClipboardList, 
  ArrowLeft,
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  GraduationCap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const ModernSidebar = ({ isCollapsed, onToggle, onLogout, user }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/enhanced-dashboard' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: BookOpen, label: 'Book Management', path: '/books' },
    { icon: ClipboardList, label: 'Borrowing Management', path: '/borrowings' },
    { icon: ArrowLeft, label: 'Returning Management', path: '/returning' },
    { icon: DollarSign, label: 'Penalty Management', path: '/penalties' },
    { icon: GraduationCap, label: 'Clearance Requirements', path: '/clearance-requirements' },
    { icon: FileText, label: 'Activity Logs', path: '/activity-logs' },
  ];

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className="fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-lg z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {!isCollapsed && (
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
              {isCollapsed && (
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

        {/* Search Bar */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-slate-200"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books, users, or activities..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
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
                      {!isCollapsed && (
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
                    {isActive && !isCollapsed && (
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
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                {/* Notifications */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Notifications</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    3
                  </Badge>
                </div>

                <Separator />

                {/* User Profile */}
                <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.username || 'Administrator'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'admin@library.com'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed User Section */}
          <AnimatePresence>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
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
  );
};

export default ModernSidebar;

