import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import axios from 'axios';

const ModernRegister = ({ onRegister, onNavigate, onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'idNumber':
        const idNumberRegex = /^[A-Z]\d{2}-\d{3,4}$/;
        if (!value.trim()) return 'ID Number is required';
        if (!idNumberRegex.test(value)) return 'Format: XXX-XXX or XXX-XXXX (e.g., C22-004)';
        return '';
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        if (!value.endsWith('@my.smciligan.edu.ph')) return 'Must be from @my.smciligan.edu.ph domain';
        return '';
      
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      case 'confirmPassword':
        if (!value.trim()) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setCurrentStep(2);
      
      // Step 1: Check ID Number
      const idCheckResponse = await axios.post('/api/auth/user/check-id', {
        idNumber: formData.idNumber,
      });

      if (!idCheckResponse.data.success) {
        setErrors({ general: idCheckResponse.data.message || 'ID number check failed' });
        setCurrentStep(1);
        return;
      }

      setCurrentStep(3);

      // Step 2: Check Email and Send Verification Code
      const emailCheckResponse = await axios.post('/api/auth/user/check-email', {
        idNumber: formData.idNumber,
        email: formData.email,
      });

      if (!emailCheckResponse.data.success) {
        setErrors({ general: emailCheckResponse.data.message || 'Email check failed' });
        setCurrentStep(1);
        return;
      }

      setCurrentStep(4);
      
      // Navigate to verification screen
      setTimeout(() => {
        onNavigate('verify', { 
          userId: emailCheckResponse.data.userId, 
          idNumber: formData.idNumber, 
          email: formData.email,
          password: formData.password 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 10) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <img 
                  src="/smc-logo.png" 
                  alt="SMC Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-sm font-medium text-slate-600">SMC Library</span>
              </div>
            </div>
            
            <div className="mx-auto mb-6">
              <img 
                src="/smc-logo.png" 
                alt="SMC Logo" 
                className="w-20 h-20 object-contain mx-auto"
              />
            </div>
            
            <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-600">
              Join our library system to access books and resources
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-8 h-0.5 ml-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{errors.general}</span>
              </motion.div>
            )}

            {/* Registration Form */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* ID Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Student ID Number
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="C22-004"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value.toUpperCase())}
                      className={`pr-10 ${errors.idNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                      maxLength={8}
                    />
                    {formData.idNumber && !errors.idNumber && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {errors.idNumber && (
                    <p className="text-sm text-red-600">{errors.idNumber}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Format: XXX-XXX or XXX-XXXX (e.g., C22-004 or C22-0044)
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="yourname@my.smciligan.edu.ph"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                      className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      type="email"
                    />
                    {formData.email && !errors.email && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Must be from @my.smciligan.edu.ph domain
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {passwordStrength.label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>
            )}

            {/* Loading Steps */}
            {currentStep > 1 && currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {currentStep === 2 && 'Checking ID Number...'}
                  {currentStep === 3 && 'Verifying Email...'}
                </h3>
                <p className="text-slate-600">
                  {currentStep === 2 && 'Please wait while we verify your student ID.'}
                  {currentStep === 3 && 'Sending verification code to your email...'}
                </p>
              </motion.div>
            )}

            {/* Success Step */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Verification Code Sent!
                </h3>
                <p className="text-slate-600">
                  Please check your email and enter the verification code to complete your registration.
                </p>
              </motion.div>
            )}

            {/* Terms and Conditions */}
            <div className="text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <button className="text-blue-600 hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button className="text-blue-600 hover:underline">Privacy Policy</button>
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ModernRegister;
