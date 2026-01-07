import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ChevronDown,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

const ModernTopBar = ({ onToggleSidebar, onLogout, user, isMobile }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
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
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm"
      >
        <div className="flex h-16 items-center justify-end px-6">
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.username || 'Administrator'}
                    </p>
                    <p className="text-xs text-slate-500">Admin</p>
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                  >
                    <Card className="border-0 shadow-none">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                              {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">
                              {user?.username || 'Administrator'}
                            </p>
                            <p className="text-sm text-slate-500">
                              {user?.email || 'admin@library.com'}
                            </p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setIsProfileOpen(false);
                              navigate('/profile-settings');
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profile Settings
                          </Button>
                          <Separator className="my-2" />
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleLogoutClick}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

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

export default ModernTopBar;
