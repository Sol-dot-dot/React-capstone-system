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

const ModernChatbotWidget = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your friendly library assistant. I can help you find amazing books using AI-powered recommendations. What are you looking for today?",
      isBot: true,
      timestamp: new Date(),
      isTyping: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible]);

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
      const response = await axios.post('http://10.0.2.2:5000/api/chatbot/recommend', {
        message: inputText.trim(),
      });

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.data.response,
          isBot: true,
          timestamp: new Date(),
          books: response.data.data.books || [],
          isTyping: false,
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I couldn't find a match in the library records, but I can still help you. Could you tell me more about what you're looking for?",
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

  const renderBookCard = (book, index) => (
    <View key={index} style={styles.bookCard}>
      <View style={styles.bookImageContainer}>
        <Icon name="book" size={24} color={ModernTheme.colors.primary} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>by {book.author}</Text>
        <Text style={styles.bookGenre}>{book.genre}</Text>
        <Text style={styles.bookDescription} numberOfLines={2}>
          {book.description}
        </Text>
        <TouchableOpacity style={styles.borrowButton}>
          <Icon name="book-open" size={16} color="#ffffff" />
          <Text style={styles.borrowButtonText}>Borrow Now</Text>
        </TouchableOpacity>
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
              <Icon name="book" size={16} color={ModernTheme.colors.primary} />
              {' '}Recommended Books
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.booksScrollView}
            >
              {message.books.map((book, index) => renderBookCard(book, index))}
            </ScrollView>
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
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        {isTyping && renderTypingIndicator()}
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
    </Animated.View>
  );
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
  booksScrollView: {
    marginHorizontal: -ModernTheme.spacing.sm,
  },
  bookCard: {
    width: screenWidth * 0.6,
    backgroundColor: '#ffffff',
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.md,
    marginHorizontal: ModernTheme.spacing.sm,
    ...ModernTheme.shadows.card,
    flexDirection: 'row',
  },
  bookImageContainer: {
    width: 50,
    height: 50,
    borderRadius: ModernTheme.borderRadius.md,
    backgroundColor: ModernTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ModernTheme.colors.textPrimary,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: ModernTheme.colors.textSecondary,
    marginBottom: 2,
  },
  bookGenre: {
    fontSize: 10,
    color: ModernTheme.colors.primary,
    fontWeight: '500',
    marginBottom: ModernTheme.spacing.xs,
  },
  bookDescription: {
    fontSize: 11,
    color: ModernTheme.colors.textMuted,
    lineHeight: 14,
    marginBottom: ModernTheme.spacing.sm,
  },
  borrowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.accent,
    paddingHorizontal: ModernTheme.spacing.sm,
    paddingVertical: ModernTheme.spacing.xs,
    borderRadius: ModernTheme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  borrowButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
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
