import { getCandidateById, getCandidateAnalysis, getCurriculum } from './dataService';

/**
 * Frontend analysis service
 * - Attempts to read the last completed interview from localStorage (key: lastInterview)
 * - Provides a transform function to normalize backend / local data shape for the UI
 */

export async function getInterviewAnalysis(sessionId) {
  // Try backend endpoint first (if project later adds one) — left as placeholder
  // For now, read from localStorage 'interviews' (array). Return the full array, or filter by sessionId.
  try {
    const raw = localStorage.getItem('interviews') || localStorage.getItem('lastInterview');
    if (!raw) return [];

    // If raw is the single lastInterview object, normalize to array
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn('getInterviewAnalysis: failed to parse interviews json', e);
      return [];
    }

    if (Array.isArray(parsed)) {
      if (sessionId) return parsed.filter(p => p.sessionId === sessionId);
      return parsed;
    }

    // single object fallback
    if (sessionId && parsed.sessionId !== sessionId) return [];
    return [ parsed ];
  } catch (e) {
    console.warn('getInterviewAnalysis: unexpected error', e);
    return [];
  }
}

/**
 * Transform raw interview + candidate data into UI-friendly shape.
 * This adapter creates fallback scores when backend fields are missing.
 */
export function transformInterviewAnalysis(raw) {
  if (!raw) return null;

  const candidate = getCandidateById(raw.candidateId);
  const candidateAnalysis = getCandidateAnalysis(raw.candidateId);
  const curriculum = getCurriculum();

  // Overall score fallback: if backend feedback contains an explicit overallScore field,
  // use it. Otherwise compute a conservative fallback based on strengths/gaps counts.
  let overallScore = null;
  if (raw.feedback && raw.feedback.overallScore) {
    overallScore = Number(raw.feedback.overallScore);
  } else {
    // Fallback heuristic: base 7.5 + 0.5 per strength - 0.7 per gap, clamped to [3,9.9]
    const strengths = (raw.feedback && raw.feedback.strengths) ? raw.feedback.strengths.length : 0;
    const gaps = (raw.feedback && raw.feedback.gaps) ? raw.feedback.gaps.length : 0;
    const calc = 7.5 + strengths * 0.5 - gaps * 0.7;
    overallScore = Math.max(3, Math.min(9.9, Math.round(calc * 10) / 10));
  }

  // Performance breakdown: prefer explicit backend scores; else map simple heuristics.
  const fallbackCategoryScore = (label) => {
    // Look for label keywords in strengths/gaps to bias score
    const strengths = raw.feedback?.strengths || [];
    const gaps = raw.feedback?.gaps || [];
    const pos = strengths.filter(s => s.toLowerCase().includes(label.toLowerCase())).length;
    const neg = gaps.filter(g => g.toLowerCase().includes(label.toLowerCase())).length;
    const base = 7.0;
    const score = Math.max(2, Math.min(10, base + pos * 1.2 - neg * 1.5));
    return Math.round(score * 10) / 10;
  };

  const performance = {
    technicalUnderstanding: raw.feedback?.scores?.technicalUnderstanding ?? fallbackCategoryScore('technical'),
    problemSolving: raw.feedback?.scores?.problemSolving ?? fallbackCategoryScore('problem'),
    systemDesign: raw.feedback?.scores?.systemDesign ?? fallbackCategoryScore('system'),
    productionAwareness: raw.feedback?.scores?.productionAwareness ?? fallbackCategoryScore('production'),
    communication: raw.feedback?.scores?.communication ?? fallbackCategoryScore('explain'),
  };

  // Curriculum performance: map candidateAnalysis.passedMissions / practiceDays to day-by-day scores
  const curriculumPerformance = [];
  const daysMap = {};
  (curriculum.days || []).forEach(d => { daysMap[d.day] = d; });

  // Use conversation to determine which days were covered if present
  const convDays = Array.isArray(raw.conversation) ? Array.from(new Set(raw.conversation.map(m => m.day).filter(Boolean))) : raw.daysCovered || [];

  // For each day in convDays, estimate a score using candidate progress (passed vs practice)
  convDays.forEach((dayNum) => {
    const dayInfo = daysMap[dayNum] || { day: dayNum, title: `Day ${dayNum}` };
    // Attempt to find mission in candidateAnalysis.passedMissions or practiceDays
    const passed = candidateAnalysis.passedMissions.find(p => p.day === dayNum);
    const practice = candidateAnalysis.practiceDays.find(p => p.day === dayNum);
    let score = 6.0;
    if (passed) {
      score = passed.attempts === 1 ? 9.0 : 7.5;
    } else if (practice) {
      score = 6.0;
    } else {
      score = 5.0;
    }

    curriculumPerformance.push({
      day: dayNum,
      title: dayInfo.title || `Day ${dayNum}`,
      score: Math.round(score * 10) / 10,
    });
  });

  // If none were found, show a few from candidateAnalysis.moduleProgress's completed counts
  if (curriculumPerformance.length === 0) {
    (candidateAnalysis.passedMissions || []).slice(0, 6).forEach(pm => {
      curriculumPerformance.push({ day: pm.day, title: pm.title || `Day ${pm.day}`, score: pm.attempts === 1 ? 9.0 : 7.0 });
    });
  }

  // Strengths, gaps, next steps, summary
  const strengths = raw.feedback?.strengths || [];
  const gaps = raw.feedback?.gaps || [];
  const nextSteps = raw.feedback?.next || [];
  const summary = raw.feedback?.summary || '';

  // Question-by-question: derive from conversation. Pair assistant prompts and user answers.
  const questions = [];
  if (Array.isArray(raw.conversation)) {
    // Find assistant messages that look like questions (have day and text), then find the next user reply
    for (let i = 0; i < raw.conversation.length; i++) {
      const item = raw.conversation[i];
      if (item.role === 'assistant') {
        const q = {
          question: item.text || '(question)',
          curriculumDay: item.day || null,
          topic: item.topic || null,
          assistantIndex: i,
          answer: null,
          score: null,
          strengths: [],
          gaps: [],
          followup: null,
        };
        // find next user message
        for (let j = i + 1; j < raw.conversation.length; j++) {
          if (raw.conversation[j].role === 'user') {
            q.answer = raw.conversation[j].text;
            // naive scoring: word count tiers
            const wc = (q.answer || '').trim().split(/\s+/).filter(Boolean).length;
            if (wc >= 80) q.score = 9; else if (wc >= 40) q.score = 7.5; else if (wc >= 15) q.score = 6; else q.score = 4.5;
            break;
          }
        }
        questions.push(q);
      }
    }
  }

  return {
    sessionId: raw.sessionId,
    candidate,
    meta: {
      completedAt: raw.completedAt,
      elapsedSeconds: raw.elapsedSeconds,
      questionCount: raw.questionCount || (questions.length || 0),
      daysCovered: raw.daysCovered || convDays
    },
    overallScore,
    performance,
    curriculumPerformance,
    strengths,
    gaps,
    nextSteps,
    questions,
    summary,
  };
}
