import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatbotWidget.css';

const ChatbotWidget = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your library assistant. I can help you find great books to read. What are you looking for today?",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/recommend', {
        message: inputText.trim(),
      });

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.data.response,
          isBot: true,
          timestamp: new Date(),
          books: response.data.data.books || [],
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message) => (
    <div key={message.id} className={`message-container ${message.isBot ? 'bot-message' : 'user-message'}`}>
      <div className={`message-bubble ${message.isBot ? 'bot-bubble' : 'user-bubble'}`}>
        <div className="message-text">{message.text}</div>
        
        {message.books && message.books.length > 0 && (
          <div className="book-recommendations">
            <div className="recommendations-title">📚 Recommended Books:</div>
            {message.books.map((book, index) => (
              <div key={index} className="book-item">
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author}</div>
                <div className="book-genre">{book.genre}</div>
                <div className="book-description" title={book.description}>
                  {book.description}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="timestamp">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className={`chatbot-widget ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="header-title">
          <span className="header-icon">📚</span>
          Library Assistant
        </div>
        <div className="header-controls">
          <button 
            className="control-button minimize-button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button 
            className="control-button close-button"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="messages-container" ref={scrollViewRef}>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">Thinking...</span>
              </div>
            )}
          </div>

          <div className="input-container">
            <textarea
              className="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about books..."
              rows="1"
              maxLength="500"
            />
            <button
              className={`send-button ${(!inputText.trim() || isLoading) ? 'disabled' : ''}`}
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotWidget;
