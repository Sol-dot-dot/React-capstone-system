import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const VerifyScreen = ({ navigation, route }) => {
  const { idNumber } = route.params;
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState('email'); // email, verify, password
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.log('VerifyScreen initialized with:', { idNumber, currentStep });

  // Log step changes
  useEffect(() => {
    console.log('Step changed to:', currentStep);
  }, [currentStep]);

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
      console.log('Sending email check request:', { idNumber, email });
      
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/check-email', {
        idNumber,
        email,
      });

      console.log('Email check response:', response.data);

      if (response.data.success) {
        setUserId(response.data.userId);
        setCurrentStep('verify');
        Alert.alert('Success', 'Verification code sent to your email!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Email check error:', error);
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
        setCurrentStep('password');
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
              onPress: () => navigation.navigate('Login'),
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

  const renderEmailStep = () => (
    <>
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
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to ID Number</Text>
      </TouchableOpacity>
    </>
  );

  const renderVerifyStep = () => (
    <>
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
        onPress={() => setCurrentStep('email')}
      >
        <Text style={styles.backButtonText}>Back to Email</Text>
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
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
        onPress={() => setCurrentStep('verify')}
      >
        <Text style={styles.backButtonText}>Back to Verification</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        
        {currentStep === 'email' && renderEmailStep()}
        {currentStep === 'verify' && renderVerifyStep()}
        {currentStep === 'password' && renderPasswordStep()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 30,
    color: '#333',
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
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
});

export default VerifyScreen;
