import React, { useEffect, useState } from 'react';
import { transformInterviewAnalysis } from '../services/analysisService';

export default function History({ onNavigate }) {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Load interview history from localStorage
  const loadHistory = () => {
    try {
      const raw = localStorage.getItem('interviews');

      if (!raw) {
        setInterviews([]);
        return;
      }

      const data = JSON.parse(raw);

      const list = Array.isArray(data) ? data : [data];

      setInterviews(
        list.sort((a, b) => {
          return (b.completedAt || 0) - (a.completedAt || 0);
        })
      );
    } catch (error) {
      console.error('Failed to load interview history:', error);
      setInterviews([]);
    }
  };

  useEffect(() => {
    loadHistory();

    // Update history when an interview is completed
    const handleInterviewCompleted = () => {
      loadHistory();
    };

    window.addEventListener(
      'interview:completed',
      handleInterviewCompleted
    );

    return () => {
      window.removeEventListener(
        'interview:completed',
        handleInterviewCompleted
      );
    };
  }, []);

  // Format date and time
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';

    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format interview duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    }

    return `${minutes} min ${remainingSeconds} sec`;
  };

  // Get score
  const getScore = (interview) => {
    if (interview.feedback?.overallScore !== undefined) {
      return Number(interview.feedback.overallScore).toFixed(1);
    }

    try {
      const analysis = transformInterviewAnalysis(interview);
      return analysis?.overallScore
        ? Number(analysis.overallScore).toFixed(1)
        : '—';
    } catch {
      return '—';
    }
  };

  // Delete one interview
  const deleteInterview = (sessionId) => {
    const updated = interviews.filter(
      interview => interview.sessionId !== sessionId
    );

    localStorage.setItem('interviews', JSON.stringify(updated));

    if (selectedInterview?.sessionId === sessionId) {
      setSelectedInterview(null);
    }

    setInterviews(updated);
  };

  // Clear complete history
  const clearHistory = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete all interview history?'
    );

    if (!confirmDelete) return;

    localStorage.removeItem('interviews');
    localStorage.removeItem('lastInterview');

    setInterviews([]);
    setSelectedInterview(null);
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Page Header */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Interview History
          </h1>

          <p
            style={{
              marginTop: '0.5rem',
              color: 'var(--text-secondary)'
            }}
          >
            Review your previous AI technical interview sessions,
            scores and feedback.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('/dashboard')}
          >
            ← Dashboard
          </button>

          {interviews.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={clearHistory}
              style={{
                color: 'var(--color-warning-light)'
              }}
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {interviews.length === 0 && (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem'
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}
          >
            📜
          </div>

          <h2
            style={{
              marginBottom: '0.75rem'
            }}
          >
            No Interview History
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '550px',
              margin: '0 auto 1.5rem'
            }}
          >
            You have not completed any interviews yet.
            Start an interview to see your results and
            performance history here.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => onNavigate('/interview')}
          >
            Start Interview →
          </button>
        </div>
      )}

      {/* Interview List */}
      {interviews.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              selectedInterview ? 'minmax(0, 1fr) 420px' : '1fr',
            gap: '1rem',
            alignItems: 'start'
          }}
        >

          {/* History Cards */}
          <div
            style={{
              display: 'grid',
              gap: '1rem'
            }}
          >
            <div
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}
            >
              {interviews.length}{' '}
              {interviews.length === 1
                ? 'interview'
                : 'interviews'}{' '}
              completed
            </div>

            {interviews.map((interview, index) => {
              const score = getScore(interview);

              const topics =
                interview.daysCovered?.length > 0
                  ? interview.daysCovered
                      .map(day => `Day ${day}`)
                      .join(' • ')
                  : 'Topics not available';

              return (
                <div
                  key={
                    interview.sessionId ||
                    `${interview.completedAt}-${index}`
                  }
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    border:
                      selectedInterview?.sessionId ===
                      interview.sessionId
                        ? '1px solid var(--accent-primary)'
                        : '1px solid var(--border-subtle)'
                  }}
                  onClick={() =>
                    setSelectedInterview(interview)
                  }
                >

                  {/* Top Section */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.3rem'
                        }}
                      >
                        INTERVIEW #{interviews.length - index}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.1rem'
                        }}
                      >
                        Technical Interview
                      </h3>

                      <div
                        style={{
                          marginTop: '0.4rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {formatDate(interview.completedAt)}
                      </div>
                    </div>

                    {/* Score */}
                    <div
                      style={{
                        minWidth: '75px',
                        textAlign: 'center',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '12px',
                        background:
                          'rgba(99, 102, 241, 0.1)',
                        border:
                          '1px solid rgba(99, 102, 241, 0.25)'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          fontFamily:
                            'var(--font-heading)'
                        }}
                      >
                        {score}
                      </div>

                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        Score
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(3, 1fr)',
                      gap: '0.75rem',
                      marginTop: '1.25rem'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        Questions
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          marginTop: '0.2rem'
                        }}
                      >
                        {interview.questionCount || 0}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        Duration
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          marginTop: '0.2rem'
                        }}
                      >
                        {formatDuration(
                          interview.elapsedSeconds
                        )}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        Session
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          marginTop: '0.2rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {interview.sessionId
                          ? interview.sessionId.slice(-8)
                          : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '0.9rem',
                      borderTop:
                        '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <strong
                      style={{
                        color: 'var(--text-primary)'
                      }}
                    >
                      Topics:
                    </strong>{' '}
                    {topics}
                  </div>

                  {/* Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1rem'
                    }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInterview(
                          interview
                        );
                      }}
                    >
                      View Details →
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteInterview(
                          interview.sessionId
                        );
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color:
                          'var(--color-warning-light)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Interview Details */}
          {selectedInterview && (
            <InterviewDetails
              interview={selectedInterview}
              onClose={() => setSelectedInterview(null)}
              formatDate={formatDate}
              formatDuration={formatDuration}
            />
          )}
        </div>
      )}
    </div>
  );
}


/* ---------------------------------------------------------
   Interview Details Component
--------------------------------------------------------- */

function InterviewDetails({
  interview,
  onClose,
  formatDate,
  formatDuration
}) {
  const feedback = interview.feedback || {};

  return (
    <div
      className="glass-card"
      style={{
        position: 'sticky',
        top: '1rem',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto'
      }}
    >

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Interview Details
          </h2>

          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginTop: '0.3rem'
            }}
          >
            {formatDate(interview.completedAt)}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-primary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* Score */}
      <div
        style={{
          textAlign: 'center',
          padding: '1.25rem',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: '12px',
          marginBottom: '1rem'
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 800
          }}
        >
          {feedback.overallScore
            ? Number(feedback.overallScore).toFixed(1)
            : '—'}
        </div>

        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}
        >
          Overall Score
        </div>
      </div>

      {/* Basic Information */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}
      >
        <InfoBox
          label="Questions"
          value={interview.questionCount || 0}
        />

        <InfoBox
          label="Duration"
          value={formatDuration(
            interview.elapsedSeconds
          )}
        />
      </div>

      {/* AI Summary */}
      <DetailSection title="AI Evaluation">
        <p
          style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}
        >
          {feedback.summary ||
            'No evaluation summary available.'}
        </p>
      </DetailSection>

      {/* Strengths */}
      <DetailSection title="Key Strengths">
        {feedback.strengths?.length > 0 ? (
          <ul
            style={{
              paddingLeft: '1.2rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            {feedback.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>
            No strengths recorded.
          </p>
        )}
      </DetailSection>

      {/* Gaps */}
      <DetailSection title="Areas to Improve">
        {feedback.gaps?.length > 0 ? (
          <ul
            style={{
              paddingLeft: '1.2rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            {feedback.gaps.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>
            No improvement areas recorded.
          </p>
        )}
      </DetailSection>

      {/* Next Steps */}
      <DetailSection title="Recommended Next Steps">
        {feedback.next?.length > 0 ? (
          <ol
            style={{
              paddingLeft: '1.2rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            {feedback.next.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>
            No recommendations recorded.
          </p>
        )}
      </DetailSection>

      {/* Questions and Answers */}
      <DetailSection title="Questions & Answers">
        {interview.conversation?.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: '1rem'
            }}
          >
            {interview.conversation.map(
              (message, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background:
                      message.role === 'assistant'
                        ? 'rgba(99, 102, 241, 0.07)'
                        : 'rgba(255,255,255,0.03)',
                    border:
                      '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color:
                        message.role === 'assistant'
                          ? 'var(--accent-purple-light)'
                          : 'var(--text-primary)',
                      marginBottom: '0.4rem'
                    }}
                  >
                    {message.role === 'assistant'
                      ? '🤖 AI Interviewer'
                      : '👤 Candidate'}
                  </div>

                  {message.topic && (
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.4rem'
                      }}
                    >
                      Day {message.day} •{' '}
                      {message.topic}
                    </div>
                  )}

                  <div
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      fontSize: '0.85rem'
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>
            Conversation transcript is not available.
          </p>
        )}
      </DetailSection>
    </div>
  );
}


/* ---------------------------------------------------------
   Small Reusable Components
--------------------------------------------------------- */

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px'
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
          marginTop: '0.25rem'
        }}
      >
        {value}
      </div>
    </div>
  );
}


function DetailSection({ title, children }) {
  return (
    <div
      style={{
        marginBottom: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)'
      }}
    >
      <h3
        style={{
          fontSize: '0.95rem',
          marginBottom: '0.6rem'
        }}
      >
        {title}
      </h3>

      {children}
    </div>
  );
}