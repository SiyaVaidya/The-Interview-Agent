import React from 'react';

export default function Analysis({ onNavigate }) {
  return (
    <div className="container">
      <div className="glass-card placeholder-page">
        <div className="placeholder-icon">📊</div>
        <h2 className="placeholder-title">Performance Analysis</h2>
        <p className="placeholder-text">
          Your detailed interview analysis will appear here — including skill evaluation scores, 
          performance graphs, AI-generated feedback, and exportable PDF reports.
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
