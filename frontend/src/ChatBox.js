import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ChatBox.css'; 

function ChatBox() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [corrected, setCorrected] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/chat', {
        message: message,
      });

      setInput(message);
      setResponse(res.data.response);
      setFeedback(res.data.feedback);
      setCorrected(res.data.correction);

      speakText(res.data.feedback);
    } catch (error) {
      setFeedback('❌ Error contacting server.');
      console.error(error);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Browser does not support speech recognition.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    };

    recognition.onend = () => {
      setIsListening(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      clearInterval(timerRef.current);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      sendMessage(spokenText);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const getHighlightedDiff = (original, corrected) => {
    if (!original || !corrected) return null;

    const origWords = original.split(' ');
    const corrWords = corrected.split(' ');

    const maxLen = Math.max(origWords.length, corrWords.length);

    return corrWords.map((word, i) => {
      const isDifferent = word !== origWords[i];
      return (
        <span key={i} style={{ backgroundColor: isDifferent ? '#ffc' : 'transparent' }}>
          {word + ' '}
        </span>
      );
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak a sentence..."
          style={{ width: '60%', padding: '10px', marginRight: '10px' }}
        />
        <button onClick={() => sendMessage()} style={{ padding: '10px' }}>
          Send
        </button>
        <button onClick={startListening} className={`mic-button ${isListening ? 'listening' : ''}`}>
          🎤 {isListening ? `Recording... (${recordingTime}s)` : 'Speak'}
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <strong>Bot:</strong> {response}
        <div style={{ marginTop: '10px', background: '#eef', padding: '10px', borderRadius: '5px' }}>
          <strong>Feedback:</strong> {feedback}
        </div>
        {corrected && (
          <div style={{ marginTop: '10px' }}>
            <strong>Highlighted Correction:</strong><br />
            {getHighlightedDiff(input, corrected)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBox;
