import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../../styles/ModernTheme';
import { buildApiUrl, getEndpoint } from '../../config/api';

// Quick action categories for better UX
const QUICK_CATEGORIES = [
  { id: 'personalized', label: 'For You', icon: 'star', color: '#FF6B6B' },
  { id: 'programming', label: 'Programming', icon: 'code', color: '#4ECDC4' },
  { id: 'web', label: 'Web Dev', icon: 'globe', color: '#45B7D1' },
  { id: 'mobile', label: 'Mobile Dev', icon: 'smartphone', color: '#96CEB4' },
  { id: 'database', label: 'Database', icon: 'database', color: '#FFEAA7' },
  { id: 'ai', label: 'AI & ML', icon: 'cpu', color: '#DDA0DD' },
  { id: 'security', label: 'Security', icon: 'shield', color: '#98D8C8' },
];

// Suggested questions for conversation starters
const SUGGESTED_QUESTIONS = [
  "What programming books do you have?",
  "Recommend books for beginners",
  "Show me web development books",
  "What's popular in the library?",
];

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'x': 'X',
    'send': '>',
    'book': 'B',
    'user': 'U',
    'bot': 'A',
    'message-circle': 'M',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '*'}
    </Text>
  );
};

// Try to import vector icons, fallback to emoji if not available
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  Icon = FallbackIcon;
}

const { width: screenWidth } = Dimensions.get('window');

const ModernChatbotWidget = ({ isVisible, onClose, userInfo = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your library assistant. I can help you find books by category, get personalized recommendations, or search for specific topics. Try the quick buttons below or ask me anything!",
      isBot: true,
      timestamp: new Date(),
      isTyping: false,
      showQuickActions: true,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userKnowledge, setUserKnowledge] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
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
      // Silent fail for user knowledge loading
    }
  };

  const generateDynamicWelcome = (userKnowledge) => {
    if (!userKnowledge) {
      return "Hello! I'm your library assistant. I can help you find books by category, get personalized recommendations, or search for specific topics. Try the quick buttons below or ask me anything!";
    }

    const { summary } = userKnowledge;

    // Simple, natural welcome based on their reading level
    if (summary.readingLevel === 'New Reader') {
      return `Welcome to your reading journey, ${summary.name}! I'm here to help you find books you'll love. Try the "For You" button for personalized picks, or browse by category!`;
    } else if (summary.readingLevel === 'Expert') {
      return `Hi ${summary.name}! I see you've read ${summary.totalBooks} books - that's impressive! Tap "For You" for personalized recommendations based on your reading history!`;
    } else {
      return `Hello ${summary.name}! I'd love to help you discover your next favorite book. Use the quick buttons below or ask me anything!`;
    }
  };

  // Handle quick category selection
  const handleQuickCategory = async (category) => {
    if (isLoading) return;

    setShowSuggestions(false);

    // If personalized, use the dedicated endpoint
    if (category.id === 'personalized') {
      const userMessage = {
        id: Date.now(),
        text: "Show me personalized recommendations",
        isBot: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      await getPersonalizedRecommendations();
      return;
    }

    // Map category to search query
    const categoryQueries = {
      programming: "programming language books like Python, Java, or JavaScript",
      web: "web development books HTML CSS JavaScript React",
      mobile: "mobile development Android iOS app development",
      database: "database SQL MySQL MongoDB data management",
      ai: "artificial intelligence machine learning deep learning",
      security: "cybersecurity network security ethical hacking",
    };

    const query = categoryQueries[category.id] || category.label;

    const userMessage = {
      id: Date.now(),
      text: `Show me ${category.label} books`,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send the optimized query
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(buildApiUrl(getEndpoint('CHATBOT', 'SEND_MESSAGE')), {
        message: query,
        conversationHistory: [],
        studentIdNumber: userInfo?.id_number || userInfo?.idNumber,
      });

      if (response.data.success && response.data.data.books?.length > 0) {
        const botMessage = {
          id: Date.now() + 1,
          text: `Here are some great ${category.label} books from our library:`,
          isBot: true,
          timestamp: new Date(),
          books: response.data.data.books,
          showBooksAsList: true,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = {
          id: Date.now() + 1,
          text: `I couldn't find ${category.label} books right now. Try another category or ask me a specific question!`,
          isBot: true,
          timestamp: new Date(),
          showQuickActions: true,
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I had trouble searching. Please try again or use a different category.",
        isBot: true,
        timestamp: new Date(),
        showQuickActions: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle suggested question tap
  const handleSuggestedQuestion = (question) => {
    setInputText(question);
    setShowSuggestions(false);
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

    const messageText = inputText.trim();
    setShowSuggestions(false);

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date(),
      isTyping: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Check if user wants personalized recommendations
      const personalizedKeywords = ['for me', 'personalized', 'my recommendations', 'suggest for me', 'based on my'];
      const wantsPersonalized = personalizedKeywords.some(keyword =>
        messageText.toLowerCase().includes(keyword)
      );

      if (wantsPersonalized && (userInfo?.id_number || userInfo?.idNumber)) {
        await getPersonalizedRecommendations();
        return;
      }

      // Prepare conversation history (last 6 messages for context)
      const conversationHistory = messages.slice(-6).map(msg => ({
        text: msg.text,
        isBot: msg.isBot,
        timestamp: msg.timestamp
      }));

      const requestData = {
        message: messageText,
        conversationHistory: conversationHistory,
      };

      // Add student ID for personalized recommendations if available
      if (userInfo && (userInfo.id_number || userInfo.idNumber)) {
        requestData.studentIdNumber = userInfo.id_number || userInfo.idNumber;
      }

      let response;
      try {
        response = await axios.post(buildApiUrl(getEndpoint('CHATBOT', 'SEND_MESSAGE')), requestData);
      } catch (mainError) {
        // Try simple endpoint as fallback
        response = await axios.post(buildApiUrl('/api/chatbot/simple'), { message: messageText });
      }

      if (response.data.success) {
        const hasBooks = response.data.data.books && response.data.data.books.length > 0;
        const responseText = response.data.data.response;

        // Check if the response seems irrelevant (backend returned unrelated books)
        const isNoMatch = responseText.includes("couldn't find") || responseText.includes("Can you specify");

        let finalText = responseText;
        let showQuickActions = false;

        if (isNoMatch || !hasBooks) {
          finalText = responseText + "\n\nTip: Try using the category buttons above for better results, or tap 'For You' for personalized recommendations!";
          showQuickActions = true;
        }

        const botMessage = {
          id: Date.now() + 1,
          text: finalText,
          isBot: true,
          timestamp: new Date(),
          books: response.data.data.books || [],
          showBooksAsList: hasBooks,
          isTyping: false,
          showQuickActions: showQuickActions,
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
      let errorText = "I couldn't find a match in the library records. Try using the category buttons for better results!";

      // Provide more specific error messages based on the error type
      if (error.response?.status === 400) {
        errorText = "There was an issue with your request. Try using the category buttons or ask in a different way.";
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
        showQuickActions: true,
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
          showBooksAsList: response.data.data.books && response.data.data.books.length > 0,
          isTyping: false,
          isPersonalized: response.data.data.isPersonalized,
          userPreferences: response.data.data.userPreferences,
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get personalized recommendations');
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now(),
        text: "I couldn't generate personalized recommendations right now. Please try again later or ask me about specific books you're interested in.",
        isBot: true,
        timestamp: new Date(),
        isTyping: false,
      };
      setMessages(prev => [...prev, errorMsg]);
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


  // Render quick category buttons
  const renderQuickCategories = () => (
    <View style={styles.quickCategoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickCategoriesScroll}
      >
        {QUICK_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.quickCategoryButton, { backgroundColor: category.color }]}
            onPress={() => handleQuickCategory(category)}
            disabled={isLoading}
          >
            <Text style={styles.quickCategoryText}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render suggested questions
  const renderSuggestions = () => {
    if (!showSuggestions || messages.length > 2) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try asking:</Text>
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => handleSuggestedQuestion(question)}
          >
            <Text style={styles.suggestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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

        {/* Show quick action buttons when suggested */}
        {message.isBot && message.showQuickActions && (
          <View style={styles.inlineQuickActions}>
            {renderQuickCategories()}
          </View>
        )}

        {/* Show books only if they're provided as separate data (for fallback cases) */}
        {message.books && message.books.length > 0 && message.showBooksAsList && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>
              Recommended Books
            </Text>
            {message.books.map((book, index) => (
              <View key={index} style={styles.textRecommendation}>
                <Text style={styles.recommendationNumber}>{index + 1}.</Text>
                <View style={styles.bookDetails}>
                  <Text style={styles.bookTitleText}>"{book.title}"</Text>
                  <Text style={styles.bookAuthorText}>by {book.author}</Text>
                  {book.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{book.category}</Text>
                    </View>
                  )}
                  {book.status && (
                    <Text style={[
                      styles.bookStatusText,
                      { color: book.status === 'available' ? '#4CAF50' : '#FF9800' }
                    ]}>
                      {book.status === 'available' ? 'Available' : 'Borrowed'}
                    </Text>
                  )}
                  {book.recommendationReason && (
                    <Text style={styles.recommendationReason}>{book.recommendationReason}</Text>
                  )}
                </View>
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
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backgroundTouchArea} />
      </TouchableWithoutFeedback>
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
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerLeft}>
              <View style={styles.botAvatarLarge}>
                <Icon name="user" size={24} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Library Assistant</Text>
                <Text style={styles.headerSubtitle}>AI-Powered Recommendations</Text>
              </View>
            </TouchableOpacity>
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

      {/* Quick Categories Bar */}
      <View style={styles.quickCategoriesBar}>
        {renderQuickCategories()}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        {isTyping && renderTypingIndicator()}
        {renderSuggestions()}
      </ScrollView>


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
        </View>
    </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backgroundTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
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
  contentWrapper: {
    flex: 1,
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
    paddingVertical: 8,
    paddingHorizontal: 4,
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
  bookDetails: {
    flex: 1,
  },
  bookTitleText: {
    fontWeight: '600',
    color: ModernTheme.colors.primary,
    fontSize: 14,
    marginBottom: 2,
  },
  bookAuthorText: {
    fontSize: 12,
    color: ModernTheme.colors.textMuted,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: ModernTheme.colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: ModernTheme.colors.primary,
    fontWeight: '500',
  },
  bookStatusText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  recommendationReason: {
    fontSize: 11,
    color: ModernTheme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Quick Categories Styles
  quickCategoriesBar: {
    backgroundColor: ModernTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
    paddingVertical: 8,
  },
  quickCategoriesContainer: {
    paddingHorizontal: 4,
  },
  quickCategoriesScroll: {
    paddingHorizontal: 8,
  },
  quickCategoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickCategoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  inlineQuickActions: {
    marginTop: 12,
    marginHorizontal: -8,
  },
  // Suggestions Styles
  suggestionsContainer: {
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginHorizontal: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: ModernTheme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  suggestionButton: {
    backgroundColor: ModernTheme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
  },
  suggestionText: {
    fontSize: 13,
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
