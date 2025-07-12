import React from 'react';

function FeedbackPanel({ feedback }) {
  return (
    <div style={{ marginTop: 10, background: '#eef', padding: 10, borderRadius: 5 }}>
      <p>{feedback}</p>
    </div>
  );
}

export default FeedbackPanel;

