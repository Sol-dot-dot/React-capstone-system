import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const NetworkTest = ({ userData }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState({});

  const testConnection = async () => {
    setTesting(true);
    const testResults = {};

    // Test multiple URLs
    const testUrls = [
      `http://localhost:5000/api/borrowing/user/${userData.idNumber}`,
      `http://10.0.2.2:5000/api/borrowing/user/${userData.idNumber}`,
      `http://127.0.0.1:5000/api/borrowing/user/${userData.idNumber}`
    ];

    for (let i = 0; i < testUrls.length; i++) {
      const testUrl = testUrls[i];
      const urlName = testUrl.includes('localhost') ? 'localhost' : 
                     testUrl.includes('10.0.2.2') ? 'android_emulator' : '127.0.0.1';
      
      try {
        console.log(`Testing ${urlName}:`, testUrl);
        
        const response = await axios.get(testUrl, { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        testResults[urlName] = {
          success: true,
          status: response.status,
          data: response.data,
          url: testUrl
        };
        
        console.log(`${urlName} successful:`, response.status);
        
        // If we get a successful response, we can stop here
        break;
        
      } catch (error) {
        console.error(`${urlName} failed:`, error.message);
        testResults[urlName] = {
          success: false,
          error: error.message,
          code: error.code,
          url: testUrl
        };
      }
    }

    // Test with buildApiUrl
    try {
      console.log('Testing with buildApiUrl...');
      const apiUrl = buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber));
      console.log('API URL:', apiUrl);
      
      const response = await axios.get(apiUrl, { timeout: 10000 });
      testResults.apiUrl = {
        success: true,
        status: response.status,
        data: response.data,
        url: apiUrl
      };
      
    } catch (error) {
      console.error('API URL test failed:', error);
      testResults.apiUrl = {
        success: false,
        error: error.message,
        code: error.code,
        url: buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber))
      };
    }

    setResults(testResults);
    setTesting(false);
    
    // Show results
    const successfulTests = Object.values(testResults).filter(result => result.success).length;
    const totalTests = Object.keys(testResults).length;
    
    let resultText = `Tests: ${successfulTests}/${totalTests} successful\n\n`;
    
    Object.entries(testResults).forEach(([key, result]) => {
      const status = result.success ? '✅' : '❌';
      resultText += `${status} ${key}: ${result.success ? 'SUCCESS' : result.error}\n`;
    });
    
    Alert.alert(
      'Network Test Results',
      resultText + '\nCheck console for details.'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Test</Text>
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      {Object.keys(results).length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {Object.entries(results).map(([key, result]) => (
            <View key={key} style={styles.resultItem}>
              <Text style={styles.resultKey}>{key}:</Text>
              <Text style={[styles.resultValue, { color: result.success ? 'green' : 'red' }]}>
                {result.success ? 'SUCCESS' : 'FAILED'}
              </Text>
              {result.error && (
                <Text style={styles.errorText}>Error: {result.error}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  results: {
    marginTop: 15,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    marginBottom: 8,
  },
  resultKey: {
    fontWeight: 'bold',
  },
  resultValue: {
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});

export default NetworkTest;
