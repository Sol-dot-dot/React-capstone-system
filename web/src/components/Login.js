import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/admin/login', formData);
      
      if (response.data.token) {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/loginbackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
        position: "relative"
      }}
    >
      {/* Vertical blurred overlay in center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px", // Adjust width as needed
          height: "100%",
          backgroundColor: "rgba(248, 250, 252, 0.7)", // Gray background with transparency
          backdropFilter: "blur(-20px)", // Blur effect - Change this value to control blur intensity
          pointerEvents: "none", // This allows clicks to pass through
          zIndex: 1
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/smc-logo.png" 
            alt="SMC Logo" 
            className="h-24 w-auto mx-auto mb-6"
            style={{
              height: '150px',
              width: 'auto',
              marginTop: '-150px',
              marginBottom: '45px',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-3 pb-8">
            <CardTitle className="text-3xl font-bold text-center text-slate-800">
              SMC Library System
            </CardTitle>
            <CardDescription className="text-center text-slate-600 text-base">
              St. Michael&apos;s College Library Management
            </CardDescription>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {error && (
              <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-semibold text-slate-700 block">
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="h-12 px-4 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 block">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-12 px-4 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Default Admin Credentials:</p>
              <p className="text-sm text-gray-600">Username: admin@library.com</p>
              <p className="text-sm text-gray-600">Password: password</p>
            </div> */}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Login;
