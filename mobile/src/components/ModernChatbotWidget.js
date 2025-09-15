import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';
import { buildApiUrl, getEndpoint } from '../config/api';

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'x': '✕',
    'send': '➤',
    'book': '📚',
    'user': '👤',
    'bot': '🤖',
    'message-circle': '💬',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '📱'}
    </Text>
  );
};

// Try to import vector icons, fallback to emoji if not available
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available, using fallback icons');
  Icon = FallbackIcon;
}

const { width: screenWidth } = Dimensions.get('window');

const ModernChatbotWidget = ({ isVisible, onClose, userInfo = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your library assistant and I'm excited to help you discover some amazing books! What's on your reading wishlist today?",
      isBot: true,
      timestamp: new Date(),
      isTyping: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userKnowledge, setUserKnowledge] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const scrollViewRef = useRef();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      // Load user knowledge when chatbot opens
      if (userInfo?.id_number || userInfo?.idNumber) {
        loadUserKnowledge();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible]);

  const loadUserKnowledge = async () => {
    try {
      const studentId = userInfo.id_number || userInfo.idNumber;
      const response = await axios.get(buildApiUrl(getEndpoint('CHATBOT', 'USER_KNOWLEDGE', studentId)));
      if (response.data.success) {
        setUserKnowledge(response.data.data);
        
        // Update the welcome message with dynamic content
        const dynamicWelcome = generateDynamicWelcome(response.data.data);
        setMessages(prev => [{
          id: 1,
          text: dynamicWelcome,
          isBot: true,
          timestamp: new Date(),
          isTyping: false,
        }]);
      }
    } catch (error) {
      console.error('Error loading user knowledge:', error);
    }
  };

  const generateDynamicWelcome = (userKnowledge) => {
    if (!userKnowledge) {
      return "Hi there! I'm your library assistant and I'm excited to help you discover some amazing books! What's on your reading wishlist today?";
    }

    const { summary } = userKnowledge;
    const welcomeMessages = [];

    // Based on reading level
    if (summary.readingLevel === 'New Reader') {
      welcomeMessages.push("Welcome to your reading journey! I'm here to help you find books that'll make you fall in love with reading. What sounds interesting to you?");
    } else if (summary.readingLevel === 'Expert') {
      welcomeMessages.push(`Hey ${summary.name}! I see you're quite the bookworm with ${summary.totalBooks} books under your belt. What's your next literary adventure?`);
    } else {
      welcomeMessages.push(`Hi ${summary.name}! I love helping readers like you discover new favorites. What kind of stories are calling to you today?`);
    }

    // Based on current status
    if (summary.currentBooks > 0) {
      welcomeMessages.push(`I see you've got ${summary.currentBooks} book${summary.currentBooks > 1 ? 's' : ''} out right now. How are you enjoying them? Need suggestions for what to read next?`);
    }

    // Based on favorite genre
    if (summary.favoriteGenre && summary.favoriteGenre !== 'None') {
      welcomeMessages.push(`I know you love ${summary.favoriteGenre} books! I've got some great new titles in that genre that I think you'll absolutely love. Want to hear about them?`);
    }

    // Based on reading activity
    if (summary.totalBooks > 10) {
      welcomeMessages.push(`Wow, ${summary.totalBooks} books! You're on fire! 🔥 What's your next reading challenge going to be?`);
    }

    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  };

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTyping]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date(),
      isTyping: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Prepare conversation history (last 6 messages for context)
      const conversationHistory = messages.slice(-6).map(msg => ({
        text: msg.text,
        isBot: msg.isBot,
        timestamp: msg.timestamp
      }));

      const requestData = {
        message: inputText.trim(),
        conversationHistory: conversationHistory
      };
      
      // Add student ID for personalized recommendations if available
      if (userInfo && (userInfo.id_number || userInfo.idNumber)) {
        requestData.studentIdNumber = userInfo.id_number || userInfo.idNumber;
        console.log('📱 Adding student ID to request:', requestData.studentIdNumber);
        console.log('📱 Conversation history length:', conversationHistory.length);
      } else {
        console.log('📱 No user info available for personalization:', { userInfo, hasIdNumber: userInfo?.id_number || userInfo?.idNumber });
      }

      let response;
      try {
        response = await axios.post(buildApiUrl(getEndpoint('CHATBOT', 'SEND_MESSAGE')), requestData);
      } catch (mainError) {
        console.log('🔄 Main chatbot failed, trying simple endpoint...');
        // Try simple endpoint as fallback
        response = await axios.post(buildApiUrl('/api/chatbot/simple'), { message: inputText.trim() });
      }

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.data.response,
          isBot: true,
          timestamp: new Date(),
          books: response.data.data.books || [],
          isTyping: false,
          // Enhanced recommendation data
          advancedRecommendations: response.data.data.advancedRecommendations || false,
          metadata: response.data.data.metadata || null,
          recommendationEngine: response.data.data.metadata?.recommendationEngine || 'basic',
          confidence: response.data.data.metadata?.confidence || 0,
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: { message: inputText.trim(), hasUserInfo: !!userInfo }
      });
      
      let errorText = "I couldn't find a match in the library records, but I can still help you. Could you tell me more about what you're looking for?";
      
      // Provide more specific error messages based on the error type
      if (error.response?.status === 400) {
        errorText = "There was an issue with your request. Please try asking in a different way or check your message length.";
      } else if (error.response?.status === 503) {
        errorText = "The AI service is currently being set up. Please try again in a few moments.";
      } else if (error.response?.status >= 500) {
        errorText = "The server is experiencing issues. Please try again later.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        isBot: true,
        timestamp: new Date(),
        isTyping: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const getPersonalizedRecommendations = async () => {
    const studentId = userInfo?.id_number || userInfo?.idNumber;
    if (!userInfo || !studentId) {
      const errorMessage = {
        id: Date.now(),
        text: "I need to know who you are to provide personalized recommendations. Please make sure you're logged in.",
        isBot: true,
        timestamp: new Date(),
        isTyping: false,
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(buildApiUrl(getEndpoint('CHATBOT', 'PERSONALIZED')), {
        studentIdNumber: studentId,
        limit: 5
      });

      if (response.data.success) {
        const botMessage = {
          id: Date.now(),
          text: response.data.data.response,
          isBot: true,
          timestamp: new Date(),
          books: response.data.data.books || [],
          isTyping: false,
          isPersonalized: response.data.data.isPersonalized,
          userPreferences: response.data.data.userPreferences,
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get personalized recommendations');
      }
    } catch (error) {
      console.error('Personalized recommendations error:', error);
      const errorMessage = {
        id: Date.now(),
        text: "I couldn't generate personalized recommendations right now. Please try again later or ask me about specific books you're interested in.",
        isBot: true,
        timestamp: new Date(),
        isTyping: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingAnim,
              transform: [{
                scale: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }
          ]} />
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingAnim,
              transform: [{
                scale: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }
          ]} />
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingAnim,
              transform: [{
                scale: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }
          ]} />
        </View>
      </View>
    </View>
  );


  const renderMessage = (message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isBot ? styles.botMessage : styles.userMessage
    ]}>
      {message.isBot && (
        <View style={styles.botAvatar}>
          <Icon name="user" size={20} color="#ffffff" />
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText
        ]}>
          {message.text}
        </Text>
        
        {message.books && message.books.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>
              📚 Recommended Books
            </Text>
            {message.books.map((book, index) => (
              <View key={index} style={styles.textRecommendation}>
                <Text style={styles.recommendationNumber}>{index + 1}.</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.bookTitleText}>"{book.title}"</Text> by {book.author}
                  {book.category && ` (${book.category})`}
                  {book.description && ` - ${book.description}`}
                  {book.reason && `\n💡 ${book.reason}`}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {!message.isBot && (
        <View style={styles.userAvatar}>
          <Icon name="user" size={20} color="#ffffff" />
        </View>
      )}
    </View>
  );

  if (!isVisible) return null;

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [400, 0],
          })
        }]
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botAvatarLarge}>
            <Icon name="user" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Library Assistant</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Recommendations</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {userKnowledge && (
            <TouchableOpacity 
              onPress={() => setShowUserProfile(!showUserProfile)} 
              style={styles.profileButton}
            >
              <Icon name="user" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile Display */}
      {showUserProfile && userKnowledge && (
        <View style={styles.userProfileContainer}>
          <Text style={styles.userProfileTitle}>Your Reading Profile</Text>
          <View style={styles.userProfileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userKnowledge.summary.totalBooks}</Text>
              <Text style={styles.statLabel}>Books Read</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userKnowledge.summary.currentBooks}</Text>
              <Text style={styles.statLabel}>Currently Reading</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userKnowledge.summary.readingLevel}</Text>
              <Text style={styles.statLabel}>Reading Level</Text>
            </View>
          </View>
          <View style={styles.userProfileDetails}>
            <Text style={styles.profileDetail}>
              <Text style={styles.profileLabel}>Favorite Genre:</Text> {userKnowledge.summary.favoriteGenre}
            </Text>
            <Text style={styles.profileDetail}>
              <Text style={styles.profileLabel}>Can Borrow:</Text> {userKnowledge.summary.canBorrow ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.profileDetail}>
              <Text style={styles.profileLabel}>Last Activity:</Text> {userKnowledge.summary.lastActivity}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        {isTyping && renderTypingIndicator()}
      </ScrollView>

      {/* Personalized Recommendations Button */}
      {userInfo && (userInfo.id_number || userInfo.idNumber) && (
        <View style={styles.personalizedButtonContainer}>
          <TouchableOpacity
            style={[styles.personalizedButton, isLoading && styles.personalizedButtonDisabled]}
            onPress={getPersonalizedRecommendations}
            disabled={isLoading}
          >
            <Icon name="book" size={16} color="#ffffff" />
            <Text style={styles.personalizedButtonText}>Get Personalized Recommendations</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about books..."
            placeholderTextColor={ModernTheme.colors.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Icon name="send" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const handleFeedback = async (messageId, feedback) => {
    try {
      console.log(`📝 User feedback: ${feedback} for message ${messageId}`);
      
      // Send feedback to backend
      await axios.post(buildApiUrl('/api/chatbot/feedback'), {
        messageId,
        feedback,
        studentIdNumber: userInfo?.id_number || userInfo?.idNumber
      });
      
      // Update UI to show feedback was received
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedbackReceived: feedback }
          : msg
      ));
      
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: ModernTheme.colors.background,
    borderTopLeftRadius: ModernTheme.borderRadius.xl,
    borderTopRightRadius: ModernTheme.borderRadius.xl,
    ...ModernTheme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ModernTheme.spacing.lg,
    backgroundColor: ModernTheme.colors.primary,
    borderTopLeftRadius: ModernTheme.borderRadius.xl,
    borderTopRightRadius: ModernTheme.borderRadius.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: ModernTheme.spacing.md,
  },
  messagesContent: {
    paddingVertical: ModernTheme.spacing.md,
  },
  messageContainer: {
    marginBottom: ModernTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ModernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.sm,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ModernTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: ModernTheme.spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.lg,
  },
  botBubble: {
    backgroundColor: ModernTheme.colors.surface,
    borderBottomLeftRadius: ModernTheme.borderRadius.sm,
  },
  userBubble: {
    backgroundColor: ModernTheme.colors.primary,
    borderBottomRightRadius: ModernTheme.borderRadius.sm,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: ModernTheme.colors.textPrimary,
  },
  userText: {
    color: '#ffffff',
  },
  recommendationsContainer: {
    marginTop: ModernTheme.spacing.md,
    paddingTop: ModernTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: ModernTheme.colors.border,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ModernTheme.colors.primary,
    marginBottom: ModernTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRecommendation: {
    flexDirection: 'row',
    marginBottom: ModernTheme.spacing.sm,
    paddingVertical: ModernTheme.spacing.xs,
  },
  recommendationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: ModernTheme.colors.primary,
    marginRight: ModernTheme.spacing.xs,
    minWidth: 20,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: ModernTheme.colors.text,
    lineHeight: 18,
  },
  bookTitleText: {
    fontWeight: '600',
    color: ModernTheme.colors.primary,
  },
  advancedRecommendationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  advancedText: {
    fontSize: 12,
    color: '#f57c00',
    fontWeight: '600',
    marginLeft: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#e65100',
    marginLeft: 8,
  },
  feedbackContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  thumbsUpButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  thumbsDownButton: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  feedbackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userProfileContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: ModernTheme.colors.primary,
  },
  userProfileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernTheme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  userProfileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ModernTheme.colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: ModernTheme.colors.textMuted,
    textAlign: 'center',
  },
  userProfileDetails: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
  },
  profileDetail: {
    fontSize: 12,
    color: ModernTheme.colors.text,
    marginBottom: 4,
  },
  profileLabel: {
    fontWeight: '600',
    color: ModernTheme.colors.primary,
  },
  timestamp: {
    fontSize: 10,
    color: ModernTheme.colors.textMuted,
    marginTop: ModernTheme.spacing.xs,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    marginBottom: ModernTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  typingBubble: {
    backgroundColor: ModernTheme.colors.surface,
    padding: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.lg,
    borderBottomLeftRadius: ModernTheme.borderRadius.sm,
    marginLeft: 36,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ModernTheme.colors.textMuted,
    marginHorizontal: 2,
  },
  personalizedButtonContainer: {
    paddingHorizontal: ModernTheme.spacing.md,
    paddingTop: ModernTheme.spacing.sm,
    paddingBottom: ModernTheme.spacing.xs,
  },
  personalizedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ModernTheme.colors.accent,
    paddingVertical: ModernTheme.spacing.sm,
    paddingHorizontal: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.lg,
    ...ModernTheme.shadows.button,
  },
  personalizedButtonDisabled: {
    backgroundColor: ModernTheme.colors.textMuted,
  },
  personalizedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: ModernTheme.spacing.xs,
  },
  inputContainer: {
    padding: ModernTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: ModernTheme.colors.border,
    backgroundColor: ModernTheme.colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.sm,
    ...ModernTheme.shadows.button,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: ModernTheme.colors.textPrimary,
    maxHeight: 100,
    marginRight: ModernTheme.spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ModernTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: ModernTheme.colors.textMuted,
  },
});

export default ModernChatbotWidget;
