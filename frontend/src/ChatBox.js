import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ChatBox.css';

function ChatBox() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text.replace(/[\u{1F600}-\u{1F64F}]/gu, ''));
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMsg = { sender: 'user', text: message, timestamp: new Date().toISOString() };
    setHistory((prev) => [...prev, userMsg]);
    setInput('');

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
    <div className="chat-box">
      <div className="chat-history">
        {history.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            <div className="avatar">
              {msg.sender === 'user' ? '🧑' : '🤖'}
            </div>
            <div className="message">
              <div className="text">{msg.text}</div>
              {msg.feedback && (
                <div className="feedback">{msg.feedback}</div>
              )}
              {msg.correction && msg.sender === 'bot' && (
                <div className="correction">
                  <strong>Correction:</strong> {msg.correction}
                </div>
              )}
              <div className="timestamp">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}
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
    </div>
  );
}

export default ChatBox;
