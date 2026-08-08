import React from 'react';

export default function History({ onNavigate }) {
  return (
    <div className="container">
      <div className="glass-card placeholder-page">
        <div className="placeholder-icon">📜</div>
        <h2 className="placeholder-title">Interview History</h2>
        <p className="placeholder-text">
          Review your previous submissions, detailed performance analysis logs, AI generated feedback on 
          vector databases, prompt engineering, RAG concepts, and export PDF interview transcripts.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
