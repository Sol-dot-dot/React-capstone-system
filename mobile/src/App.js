import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import BorrowedBooksScreen from './screens/BorrowedBooksScreen';
import PenaltyScreen from './screens/PenaltyScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import NotificationService from './services/NotificationService';
import ChatbotWidget from './components/ChatbotWidget';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, login, register, email, verify, password, forgotPassword, resetPassword, profile, changePassword, borrowedBooks, penalties
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  // Initialize push notifications when app starts
  React.useEffect(() => {
    NotificationService.initializePushNotifications();
  }, []);

  const handleLogin = async () => {
    if (!idNumber || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/login', {
        idNumber,
        password,
      });

      if (response.data.success) {
        setUserData(response.data.user);
        setCurrentScreen('dashboard');
        setIdNumber('');
        setPassword('');
        
        // Check for borrowed books notifications after login
        setTimeout(() => {
          checkBorrowedBooksNotifications();
        }, 1000);
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Making password reset request for email:', email);
      console.log('API URL:', 'http://10.0.2.2:5000/api/auth/user/request-password-reset');
      
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/request-password-reset', {
        email,
      });
      
      console.log('Password reset response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Reset Code Sent',
          'A password reset code has been sent to your email address.',
          [
            {
              text: 'OK',
              onPress: () => setCurrentScreen('resetPassword'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'An error occurred while requesting password reset';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/reset-password', {
        email,
        resetCode,
        newPassword,
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully.',
          [
            {
              text: 'OK',
              onPress: () => setCurrentScreen('login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while resetting password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIdNumberSubmit = async () => {
    if (!idNumber) {
      Alert.alert('Error', 'Please enter your ID Number');
      return;
    }

    const idPattern = /^[A-Z]\d{2}-\d{4}$/;
    if (!idPattern.test(idNumber)) {
      Alert.alert('Error', 'ID Number must be in format XXX-XXXX (e.g., C22-0044)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/check-id', {
        idNumber,
      });

      if (response.data.success) {
        setCurrentScreen('email');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while checking ID number'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!email.endsWith('@my.smciligan.edu.ph')) {
      Alert.alert('Error', 'Email must be from @my.smciligan.edu.ph domain');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/check-email', {
        idNumber,
        email,
      });

      if (response.data.success) {
        setUserId(response.data.userId);
        setCurrentScreen('verify');
        Alert.alert('Success', 'Verification code sent to your email!');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while checking email'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/verify-code', {
        idNumber,
        email,
        verificationCode,
      });

      if (response.data.success) {
        setCurrentScreen('password');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while verifying code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/complete-registration', {
        userId,
        password,
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Registration completed successfully! You can now login.',
          [
            {
              text: 'OK',
              onPress: () => setCurrentScreen('login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while completing registration'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    if (!userData?.idNumber) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://10.0.2.2:5000/api/user/profile/${userData.idNumber}`);
      
      if (response.data.success) {
        setProfileEmail(response.data.user.email);
        setCurrentScreen('profile');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData?.idNumber) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    if (!profileEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!profileEmail.endsWith('@my.smciligan.edu.ph')) {
      Alert.alert('Error', 'Email must be from @my.smciligan.edu.ph domain');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`http://10.0.2.2:5000/api/user/profile/${userData.idNumber}`, {
        email: profileEmail,
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                setUserData({ ...userData, email: profileEmail });
                setCurrentScreen('dashboard');
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userData?.idNumber) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`http://10.0.2.2:5000/api/user/change-password/${userData.idNumber}`, {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Password changed successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setCurrentScreen('dashboard');
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkBorrowedBooksNotifications = async () => {
    if (!userData?.idNumber) return;
    
    try {
      const response = await axios.get(
        `http://10.0.2.2:5000/api/borrowing/user/${userData.idNumber}`
      );

      if (response.data.success) {
        const borrowedBooks = response.data.data.borrowedBooks;
        // Use enhanced smart notifications with push notifications and email
        await NotificationService.checkAndShowSmartNotifications(borrowedBooks, userData);
        // Schedule future notifications for newly borrowed books
        NotificationService.scheduleFutureNotifications(borrowedBooks, userData);
      }
    } catch (error) {
      console.error('Error checking borrowed books notifications:', error);
    }
  };

  const handleLogout = () => {
    setCurrentScreen('welcome');
    setUserData(null);
    setIdNumber('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setUserId(null);
    setCurrentPassword('');
    setProfileEmail('');
  };


  const renderWelcomeScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Capstone Mobile App</Text>
      <Text style={styles.subtitle}>Welcome to the Capstone System</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCurrentScreen('login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setCurrentScreen('register')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Register
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Please login to your account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID Number</Text>
        <TextInput
          style={styles.input}
          value={idNumber}
          onChangeText={setIdNumber}
          placeholder="Enter your ID Number (e.g., C22-0044)"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => setCurrentScreen('forgotPassword')}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>


      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('register')}>
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRegisterScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Step 1: Enter your ID Number</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID Number</Text>
        <TextInput
          style={styles.input}
          value={idNumber}
          onChangeText={setIdNumber}
          placeholder="Enter your ID Number (e.g., C22-0044)"
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleIdNumberSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Next'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmailScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.stepTitle}>Step 2: Enter Email</Text>
      <Text style={styles.stepInfo}>ID Number: {idNumber}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email (@my.smciligan.edu.ph)"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEmailSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending Code...' : 'Send Verification Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton]}
        onPress={() => setCurrentScreen('register')}
      >
        <Text style={styles.backButtonText}>Back to ID Number</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerifyScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.stepTitle}>Step 3: Verify Email</Text>
      <Text style={styles.stepInfo}>ID Number: {idNumber}</Text>
      <Text style={styles.stepInfo}>Email: {email}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          style={styles.input}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="Enter 6-digit code"
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerificationSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton]}
        onPress={() => setCurrentScreen('email')}
      >
        <Text style={styles.backButtonText}>Back to Email</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPasswordScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.stepTitle}>Step 4: Set Password</Text>
      <Text style={styles.stepInfo}>ID Number: {idNumber}</Text>
      <Text style={styles.stepInfo}>Email: {email}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password (min 6 characters)"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePasswordSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Completing...' : 'Complete Registration'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton]}
        onPress={() => setCurrentScreen('verify')}
      >
        <Text style={styles.backButtonText}>Back to Verification</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForgotPasswordScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a reset code
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestReset}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password? </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResetPasswordScreen = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter the reset code sent to your email and your new password
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reset Code</Text>
        <TextInput
          style={styles.input}
          value={resetCode}
          onChangeText={setResetCode}
          placeholder="Enter 6-digit reset code"
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholder="Confirm new password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Back to </Text>
        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

     const renderDashboardScreen = () => (
     <View style={styles.dashboardContainer}>
       <View style={styles.welcomeCard}>
         <Text style={styles.welcomeTitle}>Welcome!</Text>
         <Text style={styles.welcomeSubtitle}>You have successfully logged in</Text>
         
         <View style={styles.userInfo}>
           <Text style={styles.userInfoLabel}>ID Number:</Text>
           <Text style={styles.userInfoValue}>{userData?.idNumber}</Text>
           
           <Text style={styles.userInfoLabel}>Email:</Text>
           <Text style={styles.userInfoValue}>{userData?.email}</Text>
         </View>

         <View style={styles.dashboardActions}>
           <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('borrowedBooks')}>
             <Text style={styles.actionButtonText}>📚 My Borrowed Books</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('penalties')}>
             <Text style={styles.actionButtonText}>💰 Penalty Information</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.actionButton} onPress={handleGetProfile}>
             <Text style={styles.actionButtonText}>View Profile</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('changePassword')}>
             <Text style={styles.actionButtonText}>Change Password</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.actionButton} onPress={() => setIsChatbotVisible(true)}>
             <Text style={styles.actionButtonText}>🤖 Ask AI Assistant</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('notificationSettings')}>
             <Text style={styles.actionButtonText}>🔔 Notification Settings</Text>
           </TouchableOpacity>
         </View>

         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
           <Text style={styles.logoutButtonText}>Logout</Text>
         </TouchableOpacity>
       </View>
     </View>
   );

   const renderProfileScreen = () => (
     <View style={styles.form}>
       <Text style={styles.title}>Profile Settings</Text>
       <Text style={styles.subtitle}>Update your profile information</Text>

       <View style={styles.inputContainer}>
         <Text style={styles.label}>ID Number</Text>
         <TextInput
           style={[styles.input, styles.disabledInput]}
           value={userData?.idNumber}
           editable={false}
         />
       </View>

       <View style={styles.inputContainer}>
         <Text style={styles.label}>Email</Text>
         <TextInput
           style={styles.input}
           value={profileEmail}
           onChangeText={setProfileEmail}
           placeholder="Enter your email (@my.smciligan.edu.ph)"
           keyboardType="email-address"
           autoCapitalize="none"
         />
       </View>

       <TouchableOpacity
         style={[styles.button, loading && styles.buttonDisabled]}
         onPress={handleUpdateProfile}
         disabled={loading}
       >
         <Text style={styles.buttonText}>
           {loading ? 'Updating...' : 'Update Profile'}
         </Text>
       </TouchableOpacity>

       <View style={styles.footer}>
         <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
           <Text style={styles.linkText}>Back to Dashboard</Text>
         </TouchableOpacity>
       </View>
     </View>
   );

   const renderChangePasswordScreen = () => (
     <View style={styles.form}>
       <Text style={styles.title}>Change Password</Text>
       <Text style={styles.subtitle}>Update your account password</Text>

       <View style={styles.inputContainer}>
         <Text style={styles.label}>Current Password</Text>
         <TextInput
           style={styles.input}
           value={currentPassword}
           onChangeText={setCurrentPassword}
           placeholder="Enter current password"
           secureTextEntry
         />
       </View>

       <View style={styles.inputContainer}>
         <Text style={styles.label}>New Password</Text>
         <TextInput
           style={styles.input}
           value={newPassword}
           onChangeText={setNewPassword}
           placeholder="Enter new password (min 6 characters)"
           secureTextEntry
         />
       </View>

       <View style={styles.inputContainer}>
         <Text style={styles.label}>Confirm New Password</Text>
         <TextInput
           style={styles.input}
           value={confirmNewPassword}
           onChangeText={setConfirmNewPassword}
           placeholder="Confirm new password"
           secureTextEntry
         />
       </View>

       <TouchableOpacity
         style={[styles.button, loading && styles.buttonDisabled]}
         onPress={handleChangePassword}
         disabled={loading}
       >
         <Text style={styles.buttonText}>
           {loading ? 'Changing...' : 'Change Password'}
         </Text>
       </TouchableOpacity>

       <View style={styles.footer}>
         <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
           <Text style={styles.linkText}>Back to Dashboard</Text>
         </TouchableOpacity>
       </View>
     </View>
   );

     const getScreenTitle = () => {
     switch (currentScreen) {
       case 'welcome': return 'Welcome';
       case 'login': return 'Login';
       case 'register': return 'Register';
       case 'email': return 'Register';
       case 'verify': return 'Register';
       case 'password': return 'Register';
       case 'forgotPassword': return 'Forgot Password';
       case 'resetPassword': return 'Reset Password';
       case 'dashboard': return 'Dashboard';
       case 'profile': return 'Profile';
       case 'changePassword': return 'Change Password';
       case 'borrowedBooks': return 'My Borrowed Books';
       case 'penalties': return 'Penalty Information';
       default: return 'Welcome';
     }
   };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Capstone Mobile App</Text>
          <Text style={styles.mainSubtitle}>{getScreenTitle()}</Text>
          
          {currentScreen === 'welcome' && renderWelcomeScreen()}
          {currentScreen === 'login' && renderLoginScreen()}
          {currentScreen === 'register' && renderRegisterScreen()}
          {currentScreen === 'email' && renderEmailScreen()}
          {currentScreen === 'verify' && renderVerifyScreen()}
          {currentScreen === 'password' && renderPasswordScreen()}
          {currentScreen === 'forgotPassword' && renderForgotPasswordScreen()}
          {currentScreen === 'resetPassword' && renderResetPasswordScreen()}
          {currentScreen === 'dashboard' && renderDashboardScreen()}
          {currentScreen === 'profile' && renderProfileScreen()}
          {currentScreen === 'changePassword' && renderChangePasswordScreen()}
          {currentScreen === 'borrowedBooks' && (
            <BorrowedBooksScreen 
              userData={userData} 
              onBack={() => setCurrentScreen('dashboard')} 
            />
          )}
          {currentScreen === 'penalties' && (
            <PenaltyScreen 
              userData={userData} 
              onBack={() => setCurrentScreen('dashboard')} 
            />
          )}
          {currentScreen === 'notificationSettings' && (
            <NotificationSettingsScreen 
              userData={userData} 
              onBack={() => setCurrentScreen('dashboard')} 
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Chatbot Button */}
      {userData && currentScreen === 'dashboard' && (
        <TouchableOpacity 
          style={styles.floatingChatButton}
          onPress={() => setIsChatbotVisible(true)}
        >
          <Text style={styles.floatingChatButtonText}>🤖</Text>
        </TouchableOpacity>
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget 
        isVisible={isChatbotVisible} 
        onClose={() => setIsChatbotVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  mainSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  stepInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
     input: {
     borderWidth: 1,
     borderColor: '#ddd',
     borderRadius: 8,
     padding: 15,
     fontSize: 16,
     backgroundColor: '#f9f9f9',
   },
   disabledInput: {
     backgroundColor: '#f0f0f0',
     color: '#666',
   },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007bff',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007bff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007bff',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userInfoValue: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 15,
  },
  dashboardActions: {
    marginBottom: 25,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingChatButtonText: {
    fontSize: 24,
    color: 'white',
  },
});

export default App;
