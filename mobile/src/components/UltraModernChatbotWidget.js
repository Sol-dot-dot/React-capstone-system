import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Modal,
  Portal,
  Card,
  TextInput,
  Button,
  Avatar,
  Surface,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { Provider as PaperProvider } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const UltraModernChatbotWidget = ({ isVisible, onClose, userInfo }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your Library Assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  // Animation values
  const modalAnim = useSharedValue(0);
  const slideAnim = useSharedValue(height);

  useEffect(() => {
    if (isVisible) {
      modalAnim.value = withTiming(1, { duration: 300 });
      slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      modalAnim.value = withTiming(0, { duration: 200 });
      slideAnim.value = withTiming(height, { duration: 200 });
    }
  }, [isVisible]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('book') || input.includes('list')) {
      return "I can help you find books! You can search by title, author, or genre. Would you like me to show you the available books or help you with a specific search?";
    } else if (input.includes('borrow') || input.includes('loan')) {
      return "For borrowing books, you'll need to visit the library or use the borrowing management system. I can help you check your current borrowed books or due dates.";
    } else if (input.includes('penalty') || input.includes('fine')) {
      return "I can help you check any penalties or fines on your account. You can also view detailed penalty information in the Penalty Management section.";
    } else if (input.includes('user') || input.includes('account')) {
      return "I can help you with user account information. You can manage user accounts, view user details, or check user verification status.";
    } else {
      return "I'm here to help with your library management needs! I can assist with books, borrowing, penalties, user management, and more. What would you like to know?";
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalAnim.value,
    };
  });

  const slideAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const MessageBubble = ({ message, index }) => {
    const messageAnim = useSharedValue(0);
    const messageSlide = useSharedValue(20);

    useEffect(() => {
      messageAnim.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
      messageSlide.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    }, []);

    const messageAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: messageAnim.value,
        transform: [{ translateY: messageSlide.value }],
      };
    });

    const isUser = message.type === 'user';

    return (
      <Animated.View style={[messageAnimatedStyle, styles.messageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {message.content}
          </Text>
          <Text style={[styles.messageTime, isUser ? styles.userTime : styles.botTime]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
        <Avatar.Text
          size={32}
          label={isUser ? (userInfo?.idNumber?.charAt(0) || 'U') : 'AI'}
          style={[
            styles.messageAvatar,
            isUser ? styles.userAvatar : styles.botAvatar,
          ]}
          labelStyle={styles.avatarLabel}
        />
      </Animated.View>
    );
  };

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Animated.View style={[modalAnimatedStyle, slideAnimatedStyle, styles.modalContent]}>
          <PaperProvider>
            <Surface style={styles.chatContainer} elevation={8}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Avatar.Text
                    size={40}
                    label="AI"
                    style={styles.headerAvatar}
                    labelStyle={styles.headerAvatarLabel}
                  />
                  <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Library Assistant</Text>
                    <Text style={styles.headerSubtitle}>Online</Text>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={onClose}
                  style={styles.closeButton}
                />
              </View>

              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}
              >
                {messages.map((message, index) => (
                  <MessageBubble key={message.id} message={message} index={index} />
                ))}
                
                {isTyping && (
                  <View style={[styles.messageContainer, styles.typingContainer]}>
                    <View style={[styles.messageBubble, styles.botBubble]}>
                      <View style={styles.typingIndicator}>
                        <ActivityIndicator size="small" color="#6B7280" />
                        <Text style={styles.typingText}>AI is typing...</Text>
                      </View>
                    </View>
                    <Avatar.Text
                      size={32}
                      label="AI"
                      style={[styles.messageAvatar, styles.botAvatar]}
                      labelStyle={styles.avatarLabel}
                    />
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
              >
                <View style={styles.inputRow}>
                  <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Ask me about books..."
                    style={styles.textInput}
                    mode="outlined"
                    multiline
                    maxLength={500}
                    outlineColor="#E5E7EB"
                    activeOutlineColor="#1E40AF"
                  />
                  <Button
                    mode="contained"
                    onPress={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    style={styles.sendButton}
                    contentStyle={styles.sendButtonContent}
                  >
                    <MaterialIcons name="send" size={20} color="#FFFFFF" />
                  </Button>
                </View>
              </KeyboardAvoidingView>
            </Surface>
          </PaperProvider>
        </Animated.View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    backgroundColor: '#1E40AF',
  },
  headerAvatarLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#10B981',
  },
  closeButton: {
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  userBubble: {
    backgroundColor: '#1E40AF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: '#E0E7FF',
  },
  botTime: {
    color: '#6B7280',
  },
  messageAvatar: {
    marginHorizontal: 4,
  },
  userAvatar: {
    backgroundColor: '#10B981',
  },
  botAvatar: {
    backgroundColor: '#6B7280',
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  typingContainer: {
    opacity: 0.7,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    minWidth: 40,
  },
  sendButtonContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});

export default UltraModernChatbotWidget;
