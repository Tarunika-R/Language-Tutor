import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBox.css';

function ChatBox() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [palette, setPalette] = useState('light');

  const fetchHistory = async () => {
    const res = await axios.get('http://localhost:5000/history');
    setHistory(res.data.reverse());
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    document.body.className = palette;
  }, [palette]);

  const sendMessage = async (msg = input) => {
    if (!msg.trim()) return;
    try {
      await axios.post('http://localhost:5000/chat', { message: msg });
      setInput('');
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported!');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      sendMessage(spokenText);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const clearHistory = async () => {
    await axios.post('http://localhost:5000/clear-history');
    fetchHistory();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="utility-buttons">
        <button onClick={clearHistory}>🧹 Clear Chat</button>
        <select
          className="palette-select"
          value={palette}
          onChange={(e) => setPalette(e.target.value)}
        >
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="lavender">💜 Lavender</option>
          <option value="teal">🌊 Teal</option>
        </select>
      </div>

      <div className="chat-history">
        {history.map((msg, i) => (
          <div key={i} className="chat-message">
            {/* User Message */}
            <div className="chat-row">
              <div
                className="avatar"
                style={{ backgroundImage: `url(https://i.pravatar.cc/40?img=4)` }}
              ></div>
              <div>
                <div className="user-msg">{msg.user_input}</div>
                <div className="timestamp">{formatTime(msg.timestamp)}</div>
              </div>
            </div>

            {/* Bot Message */}
            <div className="chat-row">
              <div
                className="avatar"
                style={{ backgroundImage: `url(https://cdn-icons-png.flaticon.com/512/4712/4712035.png)` }}
              ></div>
              <div>
                <div className="bot-msg">
                  {msg.bot_reply}
                  <div className="corrected">✏️ {msg.feedback}</div>
                </div>
                <div className="timestamp">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Type or speak here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => sendMessage()}>Send</button>
        <button
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={startListening}
        >
          🎤 {isListening ? 'Listening...' : 'Speak'}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
