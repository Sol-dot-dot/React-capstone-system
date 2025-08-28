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

const App = () => {
  const [currentStep, setCurrentStep] = useState('login'); // login, idNumber, email, verify, password, landing
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

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
        setCurrentStep('landing');
        // Clear form
        setIdNumber('');
        setPassword('');
      } else {
        Alert.alert('Error', response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIdNumberSubmit = () => {
    if (!idNumber) {
      Alert.alert('Error', 'Please enter your ID Number');
      return;
    }

    // Validate ID number format (XXX-XXXX)
    const idPattern = /^[A-Z]\d{2}-\d{4}$/;
    if (!idPattern.test(idNumber)) {
      Alert.alert('Error', 'ID Number must be in format XXX-XXXX (e.g., C22-0044)');
      return;
    }

    setCurrentStep('email');
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Validate email domain
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
        setCurrentStep('verify');
      } else {
        Alert.alert('Error', response.data.message || 'Email check failed');
      }
    } catch (error) {
      console.error('Email check error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
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
        setUserId(response.data.userId);
        setCurrentStep('password');
      } else {
        Alert.alert('Error', response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
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
        Alert.alert('Success', 'Registration completed successfully! You can now login.');
        // Reset to login
        setCurrentStep('login');
        setIdNumber('');
        setEmail('');
        setVerificationCode('');
        setPassword('');
        setConfirmPassword('');
        setUserId(null);
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startRegistration = () => {
    setCurrentStep('idNumber');
    setIdNumber('');
    setEmail('');
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
    setUserId(null);
  };

  const goBack = () => {
    if (currentStep === 'email') {
      setCurrentStep('idNumber');
      setEmail('');
    } else if (currentStep === 'verify') {
      setCurrentStep('email');
      setVerificationCode('');
    } else if (currentStep === 'password') {
      setCurrentStep('verify');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = () => {
    setCurrentStep('login');
    setUserData(null);
    setIdNumber('');
    setEmail('');
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
    setUserId(null);
  };

  const renderLoginScreen = () => (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="ID Number (e.g., C22-0044)"
        value={idNumber}
        onChangeText={setIdNumber}
        autoCapitalize="characters"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={startRegistration}>
        <Text style={styles.toggleText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLandingScreen = () => (
    <View style={styles.landingContainer}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome!</Text>
        <Text style={styles.welcomeSubtitle}>You have successfully logged in</Text>
        
        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>ID Number:</Text>
          <Text style={styles.userInfoValue}>{userData?.idNumber}</Text>
          
          <Text style={styles.userInfoLabel}>Email:</Text>
          <Text style={styles.userInfoValue}>{userData?.email}</Text>
        </View>

        <View style={styles.landingActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Help</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIdNumberScreen = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Step 1: Enter ID Number</Text>
      <TextInput
        style={styles.input}
        placeholder="ID Number (e.g., C22-0044)"
        value={idNumber}
        onChangeText={setIdNumber}
        autoCapitalize="characters"
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleIdNumberSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={() => setCurrentStep('login')}>
        <Text style={styles.toggleText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmailScreen = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Step 2: Enter Email</Text>
      <Text style={styles.stepInfo}>ID Number: {idNumber}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email (@my.smciligan.edu.ph)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEmailSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending Code...' : 'Send Verification Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={goBack}>
        <Text style={styles.toggleText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyScreen = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Step 3: Verify Email</Text>
      <Text style={styles.stepInfo}>ID Number: {idNumber}</Text>
      <Text style={styles.stepInfo}>Email: {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
        maxLength={6}
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerificationSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={goBack}>
        <Text style={styles.toggleText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordScreen = () => (
    <View style={styles.form}>
      <Text style={styles.stepTitle}>Step 4: Set Password</Text>
      <Text style={styles.stepInfo}>ID Number: {idNumber}</Text>
      <Text style={styles.stepInfo}>Email: {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePasswordSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Completing...' : 'Complete Registration'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={goBack}>
        <Text style={styles.toggleText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'login': return 'Login';
      case 'landing': return 'Dashboard';
      case 'idNumber': return 'Register';
      case 'email': return 'Register';
      case 'verify': return 'Register';
      case 'password': return 'Register';
      default: return 'Login';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Capstone Mobile App</Text>
          <Text style={styles.subtitle}>{getStepTitle()}</Text>
          
          {currentStep === 'login' && renderLoginScreen()}
          {currentStep === 'landing' && renderLandingScreen()}
          {currentStep === 'idNumber' && renderIdNumberScreen()}
          {currentStep === 'email' && renderEmailScreen()}
          {currentStep === 'verify' && renderVerifyScreen()}
          {currentStep === 'password' && renderPasswordScreen()}
          
          {currentStep !== 'landing' && (
            <Text style={styles.info}>
              {currentStep === 'login' 
                ? 'Login with your ID Number and password.'
                : 'Complete the registration process step by step.'
              }
            </Text>
          )}
        </View>
      </ScrollView>
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
  title: {
    fontSize: 24,
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
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  landingContainer: {
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
  landingActions: {
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    alignItems: 'center',
    padding: 10,
  },
  toggleText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  info: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
});

export default App;
