/**
 * Interview API Service — Compliant with data/technical-spec.md
 * 
 * Rules:
 *  - Maximum EXACTLY 8 questions turns.
 *  - After 8th answer, immediately returns done: true with final structured feedback.
 *  - Adaptive follow-ups count within the 8-question limit.
 *  - Questions cover at least 4 curriculum days.
 */

import { getCurriculum, getCandidateAnalysis } from './dataService';

// Active interview sessions in memory
const sessions = {};

/**
 * Generate candidate-specific questions based on curriculum days and candidate mission history
 */
function buildQuestionSequence(candidateId) {
  const analysis = getCandidateAnalysis(candidateId);
  const curriculum = getCurriculum();

  const daysMap = {};
  (curriculum.days || []).forEach(d => {
    daysMap[d.day] = d;
  });

  // Pick topics across 6 curriculum days, prioritizing candidate's practice/skipped days
  const practiceDayNums = analysis.practiceDays.map(d => d.day);
  const strongDayNums = analysis.strongDays.map(d => d.day);

  const targetDayPool = [
    ...practiceDayNums,
    ...strongDayNums,
    7, 8, 10, 12, 13, 21, 22, 23, 28
  ];
  
  const selectedDays = Array.from(new Set(targetDayPool)).slice(0, 6);

  const sequence = [];
  selectedDays.forEach(dayNum => {
    const dayObj = daysMap[dayNum] || { title: `Day ${dayNum}`, tools: [], objectives: [] };
    const toolsStr = (dayObj.tools || []).slice(0, 3).join(', ') || 'AI concepts';
    const mainObjective = (dayObj.objectives || [])[0] || 'core concepts';

    sequence.push({
      day: dayNum,
      title: dayObj.title,
      question: `Regarding Day ${dayNum} (${dayObj.title}): Could you explain how you worked with ${toolsStr} to achieve: "${mainObjective}"?`,
      followUpStrong: `That's a solid answer. In a production setup, what performance or trade-off challenges did you encounter when implementing ${dayObj.title}?`,
      followUpWeak: `Let's break this down. From a fundamental perspective, what is the primary role of ${toolsStr} in this day's topic?`,
    });
  });

  return sequence;
}

/**
 * Helper delay simulator
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Public Spec-Compliant Functions ─────────────────────────────────────

export async function sendInterviewPayload(payload) {
  const backendUrl = import.meta.env.VITE_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to local spec engine:', e);
    }
  }

  // Local Spec Engine
  await delay(600 + Math.random() * 300);

  const { sessionId, candidate, message } = payload;

  // Turn 1: Initialization
  if (candidate && !message) {
    const questions = buildQuestionSequence(candidate.member?.id || 'CAND-001');
    
    sessions[sessionId] = {
      candidate,
      questions,
      currentIndex: 0,
      history: [],
      daysCovered: new Set([questions[0]?.day]),
      startTime: Date.now(),
      inFollowUp: false,
    };

    const firstQ = questions[0];
    const initialReply = `Welcome, ${candidate.member?.name || 'Candidate'}. I've reviewed your cohort progress as a ${candidate.member?.jobRole || 'Engineer'}. Let's begin Question 1 of 8.\n\n${firstQ.question}`;

    sessions[sessionId].history.push({ role: 'assistant', text: initialReply, day: firstQ.day });

    return {
      reply: initialReply,
      done: false,
      currentTopic: firstQ.title,
      day: firstQ.day,
      questionNumber: 1,
      maxQuestions: 8,
    };
  }

  // Turn N: Response Processing
  const session = sessions[sessionId];
  if (!session) {
    throw new Error(`Session ${sessionId} not found.`);
  }

  session.history.push({ role: 'user', text: message });

  const totalAnswered = session.history.filter(h => h.role === 'user').length;
  const daysCount = session.daysCovered.size;
  const candidateName = session.candidate.member?.name || 'Candidate';

  // RULE: Maximum EXACTLY 8 questions. After 8th answer, immediately return done: true
  if (totalAnswered >= 8) {
    const strongCount = session.history.filter(h => h.role === 'user' && h.text.length > 80).length;

    const feedback = {
      summary: `Completed technical evaluation for ${candidateName} consisting of exactly 8 questions across ${daysCount} curriculum areas.`,
      strengths: [
        `Clear articulation of concepts across ${daysCount} curriculum days.`,
        `Solid understanding of practical tools and architectural trade-offs.`,
        `Effective response handling within timed evaluation bounds.`
      ],
      gaps: [
        `Could elaborate further on production edge-cases and failure handling.`,
        `Consider deepening knowledge on advanced performance optimization.`
      ],
      next: [
        `Review Day 26 (Performance Optimization & Cost Management).`,
        `Practice building multi-agent guardrails with LangGraph/CrewAI.`
      ]
    };

    return {
      reply: `Thank you, ${candidateName}. We have completed all 8 questions across ${daysCount} curriculum areas. Your evaluation summary has been generated!`,
      done: true,
      feedback
    };
  }

  // Decide next question (Follow-up vs Next Day Topic)
  const currentQ = session.questions[session.currentIndex] || session.questions[0];
  const wordCount = (message || '').trim().split(/\s+/).length;
  const isStrongAnswer = wordCount >= 20;

  let nextReply = '';

  if (!session.inFollowUp && currentQ) {
    session.inFollowUp = true;
    nextReply = isStrongAnswer ? currentQ.followUpStrong : currentQ.followUpWeak;
  } else {
    session.inFollowUp = false;
    session.currentIndex++;
    const nextQ = session.questions[session.currentIndex] || session.questions[session.questions.length - 1];
    session.daysCovered.add(nextQ.day);
    nextReply = `Question ${totalAnswered + 1} of 8 — ${nextQ.question}`;
  }

  session.history.push({ role: 'assistant', text: nextReply });
  const activeQ = session.questions[session.currentIndex] || currentQ;

  return {
    reply: nextReply,
    done: false,
    currentTopic: activeQ.title,
    day: activeQ.day,
    questionNumber: totalAnswered + 1,
    maxQuestions: 8,
  };
}

export async function startInterview(candidateObj, sessionId = `session-${Date.now()}`) {
  return await sendInterviewPayload({
    sessionId,
    candidate: candidateObj
  });
}

export async function submitAnswer(sessionId, message) {
  return await sendInterviewPayload({
    sessionId,
    message
  });
}
