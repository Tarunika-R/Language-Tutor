import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBox.css';

function ChatBox() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text.replace(/\p{Emoji}/gu, ''));
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;
    const userMsg = { sender: 'user', text: message, timestamp: new Date().toISOString() };
    setHistory((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:5000/chat', { message });
      const botMsg = {
        sender: 'bot',
        text: res.data.response,
        correction: res.data.correction,
        feedback: res.data.feedback,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [...prev, botMsg]);
      speakText(res.data.feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => console.error(e);
    recognition.onresult = (e) => sendMessage(e.results[0][0].transcript);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-box ${darkMode ? 'dark' : ''}`}>
      <div className="chat-header">
        <h3>Language Tutor Chat</h3>
        <button onClick={() => setDarkMode((prev) => !prev)} className="theme-toggle">
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="chat-history">
        {history.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            <div className="avatar">{msg.sender === 'user' ? '🧑' : '🤖'}</div>
            <div className="message">
              <div className="text">{msg.text}</div>
              {msg.feedback && <div className="feedback">{msg.feedback}</div>}
              {msg.correction && msg.sender === 'bot' && (
                <div className="correction">
                  <strong>Correction:</strong> {msg.correction}
                </div>
              )}
              <div className="timestamp">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble bot">
            <div className="avatar">🤖</div>
            <div className="message typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your sentence..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={() => sendMessage()}>Send</button>
        <button onClick={startListening} className={`mic-button ${isListening ? 'listening' : ''}`}>
          🎤 {isListening ? 'Listening...' : 'Speak'}
        </button>
      </div>

      <div className="theme-selector">
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="ocean">🌊 Ocean</option>
          <option value="forest">🌲 Forest</option>
          <option value="rose">🌸 Rose</option>
        </select>
      </div>
    </div>
  );
}

export default ChatBox;
