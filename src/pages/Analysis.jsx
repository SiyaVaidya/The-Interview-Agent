import React, { useEffect, useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { getInterviewAnalysis, transformInterviewAnalysis } from '../services/analysisService';
import { getCandidates, getCandidateAnalysis, getCurriculum } from '../services/dataService';

// Analysis Page — participant selector + aggregate view
export default function Analysis({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const candidates = useMemo(() => getCandidates(), []);
  const curriculum = useMemo(() => getCurriculum(), []);

  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.member?.id || null);
  const [interviews, setInterviews] = useState([]); // list of interview objects from localStorage (best-effort)
  const [activeInterview, setActiveInterview] = useState(null); // the interview currently being inspected

  // Load interviews (frontend-only storage: interviews array). Keep non-invasive and backward-compatible.
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let list = await getInterviewAnalysis();
        if (!Array.isArray(list)) list = list ? [list] : [];
        if (!mounted) return;
        setInterviews(list);
        // pick active interview if it matches selected candidate
        const match = list.find(i => i.candidateId === selectedCandidateId);
        setActiveInterview(match || null);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to read interviews');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedCandidateId]);

  // Candidate analysis derived from dataService (real existing data)
  const candidateAnalysis = useMemo(() => {
    if (!selectedCandidateId) return null;
    try {
      return getCandidateAnalysis(selectedCandidateId);
    } catch (e) {
      console.warn('candidateAnalysis failure', e);
      return null;
    }
  }, [selectedCandidateId]);

  // Helper: compute aggregate metrics for UI (kept outside JSX)
  const computeAggregates = () => {
    const interviewsForCandidate = interviews.filter(i => i.candidateId === selectedCandidateId);

    // Overall score: average of interview overallScore if available, else derive from signals
    let overallScore = null;
    if (interviewsForCandidate.length > 0) {
      const scores = interviewsForCandidate.map(i => (i.feedback?.overallScore ? Number(i.feedback.overallScore) : null)).filter(Boolean);
      if (scores.length) overallScore = Math.round((scores.reduce((a,b)=>a+b,0)/scores.length) * 10) / 10;
    }

    if (overallScore === null && candidateAnalysis) {
      // deterministic fallback based on candidate signals
      const sig = candidateAnalysis.candidate?.signals || candidateAnalysis.signals || {};
      const completed = sig.missionsCompleted || 0;
      const firstTry = sig.missionsFirstTry || 0;
      const pctFirstTry = completed ? (firstTry / completed) : 0.5;
      // map to [4.0, 9.5]
      overallScore = Math.round((4 + pctFirstTry * 5.5) * 10) / 10;
    }

    const totalInterviews = interviewsForCandidate.length;
    const totalQuestions = interviewsForCandidate.reduce((s, it) => s + (it.questionCount || 0), 0);

    // Curriculum progress: use moduleProgress from candidateAnalysis (real)
    const curriculumProgress = (candidateAnalysis?.moduleProgress || []).map(m => ({
      module: m.title || `Module ${m.n}`,
      completedCount: m.completedCount || 0,
      totalCount: m.totalCount || 0,
      percent: Math.round(((m.completedCount || 0) / (m.totalCount || 1)) * 100)
    }));

    // Skills performance: map curriculum days -> skills and score from passedMissions
    const skillMap = {
      'Technical Knowledge': [7,8,9,10],
      'Problem Solving': [10,11,12],
      'System Design': [16,21,24],
      'Prompt Engineering': [11,12,13,15],
      'RAG': [9,10,11],
      'Agentic AI': [21,22,24],
      'MCP': [23,24],
      'Production AI': [25,26,27,28,29,30]
    };

    const skills = Object.keys(skillMap).map(skillName => {
      const days = skillMap[skillName];
      // count passed days in candidateAnalysis.passedMissions
      const passed = (candidateAnalysis?.passedMissions || []).filter(p => days.includes(p.day)).length;
      const possible = days.length;
      const score = possible ? Math.round(((passed / possible) * 10) * 10) / 10 : 0;
      return { skillName, score, passed, possible };
    });

    // Strengths / gaps aggregation from interviews (dedupe)
    const strengths = Array.from(new Set(interviewsForCandidate.flatMap(i => (i.feedback?.strengths || []))));
    const gaps = Array.from(new Set(interviewsForCandidate.flatMap(i => (i.feedback?.gaps || []))));
    const nextSteps = Array.from(new Set(interviewsForCandidate.flatMap(i => (i.feedback?.next || []))));

    // Trend: list of {date, score}
    const trend = interviewsForCandidate.map(i => ({ date: i.completedAt || i.createdAt || null, score: i.feedback?.overallScore ?? null } )).filter(t=>t.score!==null).sort((a,b)=>new Date(a.date)-new Date(b.date));

    return {
      overallScore,
      totalInterviews,
      totalQuestions,
      curriculumProgress,
      skills,
      strengths,
      gaps,
      nextSteps,
      trend,
      interviewsForCandidate
    };
  };

  const aggregates = useMemo(computeAggregates, [interviews, selectedCandidateId, candidateAnalysis]);

  // Listen for live interview completion events and update the interviews list in real-time
  useEffect(() => {
    const handler = (ev) => {
      const iv = ev?.detail;
      if (!iv || !iv.sessionId) return;
      setInterviews(prev => {
        const next = [iv, ...prev.filter(p => p.sessionId !== iv.sessionId)];
        return next;
      });
      if (iv.candidateId === selectedCandidateId) {
        setActiveInterview(iv);
      }
    };

    window.addEventListener('interview:completed', handler);
    return () => window.removeEventListener('interview:completed', handler);
  }, [selectedCandidateId]);

  // UI helpers
  const ProgressBar = ({ value }) => {
    const pct = Math.max(0, Math.min(100, Math.round(value * 10) / 10));
    return (
      <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-purple-light))' }} />
      </div>
    );
  };

  const ScoreBadge = ({ score }) => (
    <div style={{ padding: '0.6rem 0.9rem', borderRadius: '999px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{score || '—'}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall</div>
    </div>
  );

  const formatPdfValue = (value, fallback = '—') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || fallback;
    return String(value);
  };

  const buildInterviewSummaryPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const addHeading = (title, level = 1) => {
      if (y > pageHeight - 70) {
        doc.addPage();
        y = margin;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(level === 1 ? 18 : 13);
      doc.setTextColor(level === 1 ? '#111827' : '#2563eb');
      doc.text(title, margin, y);
      y += level === 1 ? 24 : 18;
      return y;
    };

    const addParagraph = (text, options = {}) => {
      const { fontSize = 11, fontStyle = 'normal', indent = 0, color = '#374151' } = options;
      const textToRender = String(text || '—');
      const lines = doc.splitTextToSize(textToRender, contentWidth - indent);
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(color);
      lines.forEach((line) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin + indent, y);
        y += fontSize * 1.3;
      });
      return y;
    };

    const addBulletList = (items) => {
      const entries = Array.isArray(items) ? items : [items];
      entries.filter(Boolean).forEach((item) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = margin;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#374151');
        const text = String(item || '—');
        const lines = doc.splitTextToSize(`• ${text}`, contentWidth - 12);
        lines.forEach((line) => {
          if (y > pageHeight - 40) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin + 8, y);
          y += 12;
        });
      });
      return y;
    };

    const selectedInterview = activeInterview || aggregates.interviewsForCandidate[0] || null;
    const feedback = selectedInterview?.feedback || {};
    const candidateName = candidate?.member?.name || 'Candidate';
    const candidateRole = candidate?.member?.jobRole || 'Role unavailable';
    const interviewDate = selectedInterview?.completedAt ? new Date(selectedInterview.completedAt).toLocaleString() : 'Not available';
    const strengths = (feedback.strengths || aggregates.strengths || []).filter(Boolean);
    const weaknesses = (feedback.gaps || aggregates.gaps || []).filter(Boolean);
    const nextSteps = (feedback.next || aggregates.nextSteps || []).filter(Boolean);
    const summaryText = feedback.summary || selectedInterview?.summary || 'No interview feedback summary is currently available.';

    const questionEntries = [];
    const conversation = Array.isArray(selectedInterview?.conversation) ? selectedInterview.conversation : [];
    let currentQuestion = null;

    conversation.forEach((item) => {
      if (item?.role === 'assistant' && (item?.text || '').trim()) {
        currentQuestion = { question: item.text.trim(), answer: '', score: null };
        questionEntries.push(currentQuestion);
      } else if (currentQuestion && item?.role === 'user' && (item?.text || '').trim()) {
        currentQuestion.answer = item.text.trim();
        const wordCount = currentQuestion.answer.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount >= 80) currentQuestion.score = 9;
        else if (wordCount >= 40) currentQuestion.score = 7.5;
        else if (wordCount >= 15) currentQuestion.score = 6;
        else currentQuestion.score = 4.5;
        currentQuestion = null;
      }
    });

    if (questionEntries.length === 0 && Array.isArray(selectedInterview?.questions) && selectedInterview.questions.length) {
      selectedInterview.questions.forEach((entry) => {
        questionEntries.push({
          question: entry.question || 'Question',
          answer: entry.answer || '',
          score: entry.score ?? null,
        });
      });
    }

    y = addHeading('Interview Summary Report');
    y = addParagraph(`Candidate: ${candidateName}`);
    y = addParagraph(`Role: ${candidateRole}`);
    y = addParagraph(`Interview Date: ${interviewDate}`);
    y = addParagraph(`Overall Score: ${formatPdfValue(feedback.overallScore ?? aggregates.overallScore ?? '—')}`);
    y = addParagraph(`Questions Covered: ${formatPdfValue(selectedInterview?.questionCount ?? aggregates.totalQuestions ?? '—')}`);
    y = addParagraph(`Days Covered: ${formatPdfValue((selectedInterview?.daysCovered || []).join(', ') || '—')}`);
    y += 8;

    y = addHeading('Assessment Summary', 2);
    y = addParagraph(summaryText);
    y += 6;

    y = addHeading('Strengths', 2);
    y = addBulletList(strengths.length ? strengths : ['No strengths recorded.']);
    y += 6;

    y = addHeading('Weaknesses', 2);
    y = addBulletList(weaknesses.length ? weaknesses : ['No weaknesses recorded.']);
    y += 6;

    y = addHeading('Recommended Next Steps', 2);
    y = addBulletList(nextSteps.length ? nextSteps : ['No next steps recorded.']);
    y += 6;

    y = addHeading('Question-by-Question Results', 2);
    if (questionEntries.length) {
      questionEntries.forEach((entry, index) => {
        y = addParagraph(`${index + 1}. ${entry.question || 'Question'}`, { fontStyle: 'bold' });
        y = addParagraph(`Score: ${entry.score ?? '—'}`, { indent: 12, fontSize: 10 });
        y = addParagraph(`Answer: ${entry.answer || 'No answer recorded.'}`, { indent: 12, fontSize: 10 });
        y += 4;
      });
    } else {
      y = addParagraph('No question-by-question results were available for this interview.');
    }
    y += 6;

    y = addHeading('Additional Summary', 2);
    y = addParagraph(`Interview Count for Candidate: ${formatPdfValue(aggregates.totalInterviews ?? '—')}`);
    y = addParagraph(`Aggregate Questions: ${formatPdfValue(aggregates.totalQuestions ?? '—')}`);
    y = addParagraph(`Curriculum Progress: ${formatPdfValue(aggregates.curriculumProgress.length ? aggregates.curriculumProgress.map((module) => `${module.module}: ${module.percent}%`).join(', ') : 'None')}`);
    y = addParagraph(`Skills Snapshot: ${formatPdfValue(aggregates.skills.map((skill) => `${skill.skillName}: ${skill.score}/10`).join(', ') || 'None')}`);

    doc.save(`${candidateName || 'candidate'}-interview-summary.pdf`);
  };

  const handleDownloadPdf = () => {
    try {
      buildInterviewSummaryPdf();
    } catch (error) {
      console.error('Failed to generate PDF', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="glass-card">
          <div className="placeholder-icon">📊</div>
          <h2 className="placeholder-title">Loading Analysis</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="glass-card placeholder-page">
          <div className="placeholder-icon">⚠️</div>
          <h2 className="placeholder-title">Error loading analysis</h2>
          <p className="placeholder-text">{error}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('/dashboard')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  const candidate = candidates.find(c => c.member?.id === selectedCandidateId) || candidates[0];

  return (
    <div className="container">
      <div className="glass-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Participant Analysis</h2>
          <div style={{ color: 'var(--text-secondary)' }}>Select a participant to view aggregated interview analytics and detailed session reports.</div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={selectedCandidateId} onChange={(e)=>{ setSelectedCandidateId(e.target.value); setActiveInterview(null); }} style={{ padding: '0.5rem 0.75rem', borderRadius: 8 }}>
            {candidates.map(c => (
              <option key={c.member.id} value={c.member.id}>{c.member.name} — {c.member.jobRole}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={() => { setActiveInterview(aggregates.interviewsForCandidate[0] || null); }}>Load Latest Interview</button>

          <ScoreBadge score={aggregates.overallScore} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Summary Cards */}
          <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{candidate.member?.name}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{candidate.member?.jobRole}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>{aggregates.totalInterviews}</div>
                <div style={{ color: 'var(--text-muted)' }}>Interviews</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>{aggregates.totalQuestions}</div>
                <div style={{ color: 'var(--text-muted)' }}>Questions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>{candidateAnalysis?.signals?.missionsCompleted || '—'}</div>
                <div style={{ color: 'var(--text-muted)' }}>Curriculum Progress</div>
              </div>
            </div>
          </div>

          {/* Skills Performance */}
          <div className="glass-card">
            <h3 className="focus-section-title">Performance by Skills</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {aggregates.skills.map(s => (
                <div key={s.skillName} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.skillName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.passed}/{s.possible} completed</div>
                    <div style={{ marginTop: 6 }}><ProgressBar value={s.score * 10} /></div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 800 }}>{s.score}/10</div>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Performance (day-level) */}
          <div className="glass-card">
            <h3 className="focus-section-title">Curriculum Performance</h3>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {(candidateAnalysis?.passedMissions || []).slice(0, 12).map(pm => (
                <div key={pm.day} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 700 }}>{`Day ${pm.day} — ${pm.title}`}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pm.attempts === 1 ? 'Passed (first try)' : `${pm.attempts} attempts`}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={pm.attempts === 1 ? 100 : Math.max(30, 100 - (pm.attempts - 1) * 25)} />
                  </div>
                  <div style={{ width: 48, textAlign: 'right', fontWeight: 700 }}>{pm.attempts === 1 ? '10/10' : `${Math.max(4, 10 - (pm.attempts-1)*2)}/10`}</div>
                </div>
              ))}

              {(!candidateAnalysis || (candidateAnalysis.passedMissions || []).length === 0) && (
                <div style={{ color: 'var(--text-secondary)' }}>No curriculum performance available for this participant yet.</div>
              )}
            </div>
          </div>

          {/* Performance Trend */}
          <div className="glass-card">
            <h3 className="focus-section-title">Performance Trend</h3>
            {aggregates.trend.length <= 1 ? (
              <div style={{ color: 'var(--text-secondary)' }}>Not enough interviews to display a trend. Complete more interviews to see score history.</div>
            ) : (
              <TrendChart points={aggregates.trend} />
            )}
          </div>

          {/* Strengths & Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ fontWeight: 700 }}>Strengths</div>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: 16 }}>
                {aggregates.strengths.length === 0 ? <li>None recorded</li> : aggregates.strengths.map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="glass-card">
              <div style={{ fontWeight: 700 }}>Areas to Improve</div>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: 16 }}>
                {aggregates.gaps.length === 0 ? <li>None recorded</li> : aggregates.gaps.map((g,i)=><li key={i}>{g}</li>)}
              </ul>
            </div>
          </div>

          {/* AI Assessment & Next Steps */}
          <div className="glass-card">
            <h3 className="focus-section-title">AI Assessment</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{(activeInterview?.feedback?.summary) || 'No AI assessment available for the selected participant (run an interview to generate one).'}</p>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 700 }}>Recommended Next Steps</div>
              <ol style={{ color: 'var(--text-secondary)', paddingLeft: 18, marginTop: 6 }}>
                {(aggregates.nextSteps.length>0) ? aggregates.nextSteps.map((n,i)=><li key={i}>{n}</li>) : <li>No recommendations recorded.</li>}
              </ol>
            </div>
          </div>

          {/* Interview Summary Table */}
          <div className="glass-card">
            <h3 className="focus-section-title">Interview Summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.5rem' }}>#</th>
                  <th style={{ padding: '0.5rem' }}>Date</th>
                  <th style={{ padding: '0.5rem' }}>Score</th>
                  <th style={{ padding: '0.5rem' }}>Questions</th>
                  <th style={{ padding: '0.5rem' }}>Topics</th>
                  <th style={{ padding: '0.5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {aggregates.interviewsForCandidate.length === 0 && (
                  <tr><td colSpan={6} style={{ color: 'var(--text-secondary)', padding: '0.8rem' }}>No interviews found.</td></tr>
                )}
                {aggregates.interviewsForCandidate.map((iv, idx) => (
                  <tr key={iv.sessionId} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.6rem' }}>{idx+1}</td>
                    <td style={{ padding: '0.6rem' }}>{iv.completedAt ? new Date(iv.completedAt).toLocaleString() : '—'}</td>
                    <td style={{ padding: '0.6rem' }}>{iv.feedback?.overallScore ?? '—'}</td>
                    <td style={{ padding: '0.6rem' }}>{iv.questionCount ?? '—'}</td>
                    <td style={{ padding: '0.6rem' }}>{(iv.daysCovered||[]).join(', ') || '—'}</td>
                    <td style={{ padding: '0.6rem' }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right column */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Selected Participant</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{candidate.member?.name} • {candidate.member?.jobRole}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{aggregates.overallScore}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Score</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>Curriculum Modules</div>
              <div style={{ marginTop: 8 }}>
                {aggregates.curriculumProgress.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No module progress</div>}
                {aggregates.curriculumProgress.map((m,i)=>(
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>{m.module}</div>
                    <div style={{ width: 90, textAlign: 'right', fontWeight: 700 }}>{m.percent}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => { if (activeInterview) { setActiveInterview(activeInterview); window.scrollTo({top:0, behavior:'smooth'}); } else { onNavigate('/interview'); } }}>{activeInterview ? 'View Active Interview' : 'Start Interview'}</button>
              <button className="btn btn-secondary" onClick={handleDownloadPdf}>Download as PDF</button>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ fontWeight: 700 }}>Days Covered</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{(activeInterview?.daysCovered || candidateAnalysis?.passedMissions?.map(m=>m.day) || []).join(', ') || '—'}</div>
          </div>

          <div className="glass-card">
            <div style={{ fontWeight: 700 }}>Quick Actions</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => { localStorage.removeItem('interviews'); localStorage.removeItem('lastInterview'); window.location.reload(); }}>Clear Demo Data</button>
              <button className="btn btn-outline" onClick={() => onNavigate('/history')}>Open History</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Small inline SVG trend chart (no extra deps)
function TrendChart({ points }) {
  // points: [{date, score}]
  const w = 480, h = 120, pad = 28;
  const vals = points.map(p => Number(p.score));
  const dates = points.map(p => new Date(p.date));
  const min = Math.min(...vals), max = Math.max(...vals);
  const scaleX = (i) => pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2);
  const scaleY = (v) => h - pad - ((v - min) / Math.max(0.0001, (max - min))) * (h - pad * 2);
  const path = vals.map((v,i)=>`${i===0? 'M':'L'} ${scaleX(i)} ${scaleY(v)}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
      <path d={path} fill="none" stroke="url(#g)" strokeWidth={2} strokeLinecap="round" />
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      {vals.map((v,i)=>(<circle key={i} cx={scaleX(i)} cy={scaleY(v)} r={3} fill="#fff" stroke="#4F46E5" />))}
    </svg>
  );
}
