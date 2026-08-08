import React from 'react';
import { getCandidates, getCandidateAnalysis } from '../services/dataService';

export default function Dashboard({ onNavigate, selectedCandidateId, onSelectCandidate }) {
  const candidates = getCandidates();
  const analysis = getCandidateAnalysis(selectedCandidateId);
  const member = analysis.member || {};

  const stats = [
    { label: "Missions Completed", value: `${analysis.signals.missionsCompleted || analysis.passedMissions.length} / 31` },
    { label: "First-Try Passes", value: `${analysis.signals.missionsFirstTry || analysis.strongDays.length}` },
    { label: "Commit Days", value: `${analysis.signals.commitDays || 25} days` },
    { label: "Experience", value: `${member.yearsExperience || 0} yrs (${member.jobRole || 'Engineer'})` }
  ];

  const recentInterview = {
    date: "August 8, 2026",
    score: `${Math.round(((analysis.signals.missionsFirstTry || 20) / 31) * 100)}%`,
    topics: analysis.strongDays.slice(0, 3).map(d => d.title)
  };

  return (
    <div className="welcome-section">
      {/* Top Header with Candidate Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="welcome-title">Welcome back, {member.name || 'Candidate'}</h1>
          <p className="welcome-subtitle">
            {member.jobRole} &bull; {member.education} &bull; Cohort Learning Journey
          </p>
        </div>

        {/* Candidate Switcher Dropdown */}
        <div className="glass-card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Candidate:</span>
          <select
            value={selectedCandidateId}
            onChange={(e) => onSelectCandidate(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {candidates.map(c => (
              <option key={c.member.id} value={c.member.id} style={{ background: '#12182B', color: '#F8FAFC' }}>
                {c.member.name} ({c.member.jobRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        {/* Left Column: CTA and Recent Interview */}
        <div className="dashboard-left">
          
          {/* Start Interview Card */}
          <div className="glass-card cta-card">
            <h2 className="cta-title">Ready for your technical interview?</h2>
            <p className="cta-desc">
              Your AI interviewer will evaluate your understanding of the concepts you've learned 
              throughout the cohort and adapt its questions based on your responses.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => onNavigate('/interview')}
              id="start-interview-dashboard-btn"
            >
              Start Interview for {member.name?.split(' ')[0]} &rarr;
            </button>
          </div>

          {/* Recent Interview */}
          <div className="glass-card recent-card">
            <div className="recent-header">
              <div className="recent-meta">
                <span className="stat-label">Latest Assessment</span>
                <span className="recent-date">{recentInterview.date}</span>
              </div>
              <div className="recent-score-badge">
                <div className="recent-score-val">{recentInterview.score}</div>
                <div className="recent-score-lbl">Score</div>
              </div>
            </div>
            
            <div className="recent-topics">
              <strong>Focus Topics:</strong><br />
              {recentInterview.topics.length > 0 ? recentInterview.topics.join(' • ') : 'RAG • Vector DBs • Agentic AI'}
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('/history')}
            >
              View Details
            </button>
          </div>

        </div>

        {/* Right Column: Stats and Learning Journey */}
        <div className="dashboard-right">
          
          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card stat-card">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Learning Journey focus */}
          <div className="glass-card">
            <h3 className="focus-section-title">Interview Focus for {member.name?.split(' ')[0]}</h3>
            
            <div className="journey-group">
              <div className="journey-group-title">
                <span>Strong Areas (1st-Try Pass)</span>
                <span className="badge-count">{analysis.strongDays.length}</span>
              </div>
              <div className="badge-container">
                {analysis.strongDays.slice(0, 4).map((item, i) => (
                  <span key={i} className="badge badge-strong">
                    <span style={{ fontSize: '1.1rem', marginRight: '2px' }}>✓</span> Day {item.day}: {item.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="journey-group" style={{ marginTop: '1.5rem' }}>
              <div className="journey-group-title">
                <span>Areas to Practice</span>
                <span className="badge-count">{analysis.practiceDays.length}</span>
              </div>
              <div className="badge-container">
                {analysis.practiceDays.slice(0, 4).map((item, i) => (
                  <span key={i} className="badge badge-practice">
                    <span style={{ fontSize: '1.2rem', marginRight: '2px', lineHeight: 1 }}>⚠</span> Day {item.day}: {item.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
