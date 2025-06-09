import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('http://localhost:5000');

export default function App() {
  const [content, setContent] = useState('');
  const [docId, setDocId] = useState('default-doc');

  useEffect(() => {
    axios.get(`http://localhost:5000/documents/${docId}`).then((res) => {
      setContent(res.data.content);
    });

    socket.emit('join', docId);

    socket.on('receive-changes', (delta) => {
      setContent(delta);
    });

    return () => {
      socket.off('receive-changes');
    };
  }, [docId]);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    socket.emit('send-changes', { docId, content: value });
  };

  return (
    <div className="app">
      <h2>Real-Time Collaborative Editor</h2>
      <textarea
        value={content}
        onChange={handleChange}
        rows={20}
        cols={80}
        style={{ fontSize: '1rem', padding: '1rem' }}
      />
    </div>
  );
}
