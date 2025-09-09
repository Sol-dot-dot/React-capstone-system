import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

const ModernChatbotWidget = ({ isVisible, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your Library Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      timestamp: new Date()
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
        timestamp: new Date()
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const widgetVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    minimized: {
      height: 60,
      transition: { duration: 0.3 }
    },
    expanded: {
      height: 500,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={widgetVariants}
          initial="hidden"
          animate={isMinimized ? "minimized" : "visible"}
          exit="hidden"
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="w-80 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            {isMinimized ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsMinimized(false)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Library Assistant</p>
                    <p className="text-xs text-slate-500">Click to expand</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.38 14.99 3.05 16.28L2 22L7.72 20.95C9.01 21.62 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2ZM12 20C10.74 20 9.54 19.78 8.44 19.38L8 19.15L5.2 20.05L6.1 17.25L5.87 16.81C5.47 15.71 5.25 14.51 5.25 13.25C5.25 8.13 9.13 4.25 14.25 4.25S23.25 8.13 23.25 13.25 19.37 20 14.25 20H12Z" fill="currentColor"/>
                            <circle cx="9" cy="12" r="1" fill="currentColor"/>
                            <circle cx="15" cy="12" r="1" fill="currentColor"/>
                          </svg>
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">Library Assistant</CardTitle>
                        <p className="text-xs text-slate-500">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMinimized(true)}
                        className="p-1 h-8 w-8"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="h-80 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarFallback className={`text-xs ${
                              message.type === 'user' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                            }`}>
                              {message.type === 'user' ? (
                                <User className="h-3 w-3" />
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.38 14.99 3.05 16.28L2 22L7.72 20.95C9.01 21.62 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2ZM12 20C10.74 20 9.54 19.78 8.44 19.38L8 19.15L5.2 20.05L6.1 17.25L5.87 16.81C5.47 15.71 5.25 14.51 5.25 13.25C5.25 8.13 9.13 4.25 14.25 4.25S23.25 8.13 23.25 13.25 19.37 20 14.25 20H12Z" fill="currentColor"/>
                                  <circle cx="9" cy="12" r="1" fill="currentColor"/>
                                  <circle cx="15" cy="12" r="1" fill="currentColor"/>
                                </svg>
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg px-3 py-2 ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-2">
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.38 14.99 3.05 16.28L2 22L7.72 20.95C9.01 21.62 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2ZM12 20C10.74 20 9.54 19.78 8.44 19.38L8 19.15L5.2 20.05L6.1 17.25L5.87 16.81C5.47 15.71 5.25 14.51 5.25 13.25C5.25 8.13 9.13 4.25 14.25 4.25S23.25 8.13 23.25 13.25 19.37 20 14.25 20H12Z" fill="currentColor"/>
                                <circle cx="9" cy="12" r="1" fill="currentColor"/>
                                <circle cx="15" cy="12" r="1" fill="currentColor"/>
                              </svg>
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-slate-100 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-sm text-slate-500">Typing...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about books..."
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModernChatbotWidget;

