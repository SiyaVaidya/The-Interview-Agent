import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getCandidateById } from '../services/dataService';
import { startInterview, submitAnswer } from '../services/interviewApi';

const PHASE = {
  SETUP: 'setup',
  ACTIVE: 'active',
  COMPLETE: 'complete',
};

const QUESTION_TIMEOUT_SECONDS = 300; // 5 minutes per question

export default function Interview({ onNavigate, candidateId = 'CAND-001' }) {
  const candidate = getCandidateById(candidateId);
  const member = candidate.member || {};

  const [phase, setPhase] = useState(PHASE.SETUP);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Active chat state
  const [conversation, setConversation] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [currentTopic, setCurrentTopic] = useState('Introduction');
  const [currentDay, setCurrentDay] = useState(1);
  const [questionNumber, setQuestionNumber] = useState(1);
  const totalMaxQuestions = 8; // Exactly 8 questions max

  // Timers: Overall elapsed (counts up) vs Question Countdown (5:00 counts down)
  const [elapsed, setElapsed] = useState(0);
  const [questionTime, setQuestionTime] = useState(QUESTION_TIMEOUT_SECONDS);

  // Completion structured feedback state
  const [feedback, setFeedback] = useState(null);

  // Refs & Guards
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const startTimeRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Auto-scroll logic: Only scroll into view when there are 2+ messages or AI is thinking
  useEffect(() => {
    if (chatEndRef.current && (conversation.length > 1 || isThinking)) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [conversation.length, isThinking]);

  // Overall Elapsed Timer (counts up continuously from 0:00, does not end interview)
  useEffect(() => {
    if (phase !== PHASE.ACTIVE) return;
    const timer = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Reset 5-minute Countdown Timer whenever a new question starts
  useEffect(() => {
    if (phase === PHASE.ACTIVE) {
      setQuestionTime(QUESTION_TIMEOUT_SECONDS);
      isSubmittingRef.current = false;
    }
  }, [questionNumber, phase]);

  // 5-Minute Question Countdown Timer (5:00 -> 0:00)
  useEffect(() => {
    if (phase !== PHASE.ACTIVE || isThinking) return;

    const timer = setInterval(() => {
      setQuestionTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger auto-submit when timer reaches 0:00
          if (!isSubmittingRef.current) {
            isSubmittingRef.current = true;
            setTimeout(() => {
              handleAutoSubmitTimeout();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isThinking, questionNumber]);

  const formatMinSec = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Core Submit Function ─────────────────────────────────

  const handleSubmitMessage = useCallback(async (messageText) => {
    if (isThinking || isSubmittingRef.current && messageText !== answerText) return;
    isSubmittingRef.current = true;

    const userMessage = messageText.trim();
    setAnswerText('');

    // Append candidate answer to conversation UI
    setConversation(prev => [
      ...prev,
      { role: 'user', text: userMessage }
    ]);

    setIsThinking(true);

    try {
      const res = await submitAnswer(sessionId, userMessage);
      setIsThinking(false);

      if (res.done) {
        setFeedback(res.feedback);
        setPhase(PHASE.COMPLETE);
      } else {
        setConversation(prev => [
          ...prev,
          { role: 'assistant', text: res.reply, day: res.day, topic: res.currentTopic }
        ]);
        if (res.currentTopic) setCurrentTopic(res.currentTopic);
        if (res.day) setCurrentDay(res.day);
        if (res.questionNumber) setQuestionNumber(res.questionNumber);

        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setIsThinking(false);
      isSubmittingRef.current = false;
    }
  }, [answerText, isThinking, sessionId]);

  // Handle manual submit (Button click or Enter)
  const handleManualSubmit = () => {
    if (!answerText.trim() || isThinking) return;
    handleSubmitMessage(answerText.trim());
  };

  // Handle timeout auto-submit (Timer hits 0:00)
  const handleAutoSubmitTimeout = () => {
    const currentText = textareaRef.current ? textareaRef.current.value : answerText;
    const textToSubmit = currentText.trim() ? currentText.trim() : "(Time expired - No answer provided)";
    handleSubmitMessage(textToSubmit);
  };

  // ─── Start Interview ─────────────────────────────────────

  const handleStartInterview = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSessionId = `session-${Date.now()}`;
      setSessionId(newSessionId);

      const res = await startInterview(candidate, newSessionId);

      setConversation([
        { role: 'assistant', text: res.reply, day: res.day, topic: res.currentTopic }
      ]);
      if (res.currentTopic) setCurrentTopic(res.currentTopic);
      if (res.day) setCurrentDay(res.day);
      if (res.questionNumber) setQuestionNumber(res.questionNumber);

      startTimeRef.current = Date.now();
      setPhase(PHASE.ACTIVE);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsLoading(false);
    }
  }, [candidate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  const progressPercent = Math.min((questionNumber / totalMaxQuestions) * 100, 100);

  // ─── Setup View ───────────────────────────────────────────

  if (phase === PHASE.SETUP) {
    return (
      <div className="interview-setup" id="interview-setup">
        <div className="glass-card interview-briefing">
          <div className="interview-briefing-icon">🎯</div>
          <h1 className="interview-briefing-title">Technical Interview</h1>
          <p className="interview-briefing-subtitle">
            Evaluating <strong>{member.name}</strong> ({member.jobRole}) based on the 31-day AI Cohort curriculum.
          </p>

          <div className="interview-briefing-details">
            <div className="briefing-item">
              <span className="briefing-item-icon">⏱</span>
              <div>
                <strong>Exactly 8 Questions (5:00 Per Question)</strong>
                <p>Each question has a 5-minute countdown. Questions auto-submit on timeout.</p>
              </div>
            </div>
            <div className="briefing-item">
              <span className="briefing-item-icon">💬</span>
              <div>
                <strong>Multi-Turn Adaptive AI Agent</strong>
                <p>Adaptive follow-ups count within the 8-question limit across 4+ curriculum days.</p>
              </div>
            </div>
            <div className="briefing-item">
              <span className="briefing-item-icon">📊</span>
              <div>
                <strong>Immediate Structured Feedback</strong>
                <p>After Question 8, your final technical evaluation is generated instantly.</p>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary interview-start-btn"
            onClick={handleStartInterview}
            disabled={isLoading}
            id="begin-interview-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Initializing API Session...
              </>
            ) : (
              `Begin Interview for ${member.name?.split(' ')[0]} →`
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Completion View ──────────────────────────────────────

  if (phase === PHASE.COMPLETE && feedback) {
    return (
      <div className="interview-setup" id="interview-complete">
        <div className="glass-card completion-card" style={{ maxWidth: '720px' }}>
          <div className="completion-icon">✓</div>
          <h1 className="completion-title">Interview Completed</h1>
          <p className="completion-subtitle">
            8-Question Technical Assessment for <strong>{member.name}</strong> is complete.
          </p>

          {/* Technical Spec Structured Feedback */}
          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Evaluation Summary</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {feedback.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-success-light)', marginBottom: '0.5rem' }}>Key Strengths</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {(feedback.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-warning-light)', marginBottom: '0.5rem' }}>Areas to Deepen (Gaps)</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {(feedback.gaps || []).map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-purple-light)', marginBottom: '0.5rem' }}>Recommended Next Steps</h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {(feedback.next || []).map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          </div>

          <div className="completion-actions">
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('/analysis')}
              id="view-analysis-btn"
            >
              View Detailed Analysis →
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active Interview View ────────────────────────────────

  return (
    <div className="interview-active" id="interview-active">
      {/* Header */}
      <div className="interview-header">
        <div className="interview-header-left">
          <h2 className="interview-header-title">Technical Interview &bull; {member.name}</h2>
          <div className="interview-header-meta">
            <span className="interview-job-role">{member.jobRole}</span>
            <span className="meta-separator">&bull;</span>
            <span className="interview-question-count">
              Question {questionNumber} of {totalMaxQuestions}
            </span>
            <span className="meta-separator">&bull;</span>
            <span className="interview-timer" title="Total Elapsed Time">⏱ Elapsed: {formatMinSec(elapsed)}</span>
          </div>
        </div>
        
        {/* Right Side: Topic & Per-Question Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Per-Question 5-Minute Timer Badge */}
          <div 
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: questionTime <= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.1)',
              border: `1px solid ${questionTime <= 60 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(99, 102, 241, 0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Time Left:
            </span>
            <span 
              style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 800, 
                fontSize: '1rem',
                color: questionTime <= 60 ? 'var(--color-warning-light)' : 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              ⌛ {formatMinSec(questionTime)}
            </span>
          </div>

          <div className="interview-topic-badge">
            <span className="interview-topic-day">Day {currentDay}</span>
            <span className="interview-topic-name">{currentTopic}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="interview-progress">
        <div className="interview-progress-bar">
          <div className="interview-progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="interview-progress-label">Q{questionNumber} / {totalMaxQuestions}</span>
      </div>

      {/* AI Interviewer Section Header */}
      <div className="interview-section-header">
        <span className="section-header-title">🤖 AI Interviewer</span>
      </div>

      {/* Chat Conversation Box */}
      <div className="interview-chat">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.role === 'assistant' ? 'chat-ai' : 'chat-candidate'}`}
          >
            <div className="chat-message-header">
              <span className="chat-message-sender">
                {msg.role === 'assistant' ? '🤖 AI Interviewer' : `👤 ${member.name?.split(' ')[0] || 'You'}`}
              </span>
              {msg.topic && (
                <span className="chat-topic-tag">Day {msg.day}: {msg.topic}</span>
              )}
            </div>
            <div className="chat-message-content">
              {msg.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="chat-message chat-ai">
            <div className="chat-message-header">
              <span className="chat-message-sender">🤖 AI Interviewer</span>
            </div>
            <div className="chat-message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Candidate Response Section Header */}
      <div className="interview-section-header" style={{ marginTop: '0.4rem' }}>
        <span className="section-header-title">👤 Candidate Response</span>
      </div>

      {/* Candidate Response Input Area */}
      <div className="answer-area">
        <div className="answer-input-wrapper">
          <textarea
            ref={textareaRef}
            className="answer-textarea"
            placeholder="Type your technical response here... (Shift+Enter for new line)"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            rows={3}
            id="answer-input"
          />
          <div className="answer-footer">
            <span className="answer-char-count">
              {answerText.trim() ? `${answerText.trim().split(/\s+/).length} words` : ''}
            </span>
            <button
              className="btn btn-primary answer-submit-btn"
              onClick={handleManualSubmit}
              disabled={!answerText.trim() || isThinking}
              id="submit-answer-btn"
            >
              {isThinking ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                'Submit Response →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
