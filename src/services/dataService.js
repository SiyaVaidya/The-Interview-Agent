/**
 * Data Service — Interface for Curriculum & Candidate Profiles
 * Loads from data/curriculum.json and data/candidates.json
 */

import curriculumData from '../../data/curriculum.json';
import candidatesData from '../../data/candidates.json';

export function getCurriculum() {
  return curriculumData;
}

export function getCandidates() {
  return candidatesData.candidates || [];
}

export function getCandidateById(candidateId) {
  const candidates = getCandidates();
  return candidates.find(c => c.member.id === candidateId) || candidates[0];
}

/**
 * Process a candidate profile into detailed learning signals
 * Returns strong topics, practice/gap topics, completed missions, and stats
 */
export function getCandidateAnalysis(candidateId) {
  const candidate = getCandidateById(candidateId);
  const curriculum = getCurriculum();

  const daysMap = {};
  (curriculum.days || []).forEach(d => {
    daysMap[d.day] = d;
  });

  const missions = candidate.missions || [];
  
  const passedMissions = [];
  const strongDays = [];
  const practiceDays = [];
  const skippedDays = [];

  missions.forEach(m => {
    const dayInfo = daysMap[m.day] || { title: m.title, day: m.day, tools: [] };
    if (m.skipped) {
      skippedDays.push({ ...m, ...dayInfo });
    } else if (m.passed) {
      passedMissions.push({ ...m, ...dayInfo });
      if (m.attempts === 1) {
        strongDays.push({ ...m, ...dayInfo });
      } else {
        practiceDays.push({ ...m, ...dayInfo, reason: `${m.attempts} attempts required` });
      }
    } else {
      practiceDays.push({ ...m, ...dayInfo, reason: 'Failed mission attempt' });
    }
  });

  // Modules summary
  const moduleMap = {};
  (curriculum.modules || []).forEach(mod => {
    moduleMap[mod.n] = {
      ...mod,
      completedCount: 0,
      totalCount: mod.days[1] - mod.days[0] + 1
    };
  });

  passedMissions.forEach(pm => {
    for (const modId in moduleMap) {
      const mod = moduleMap[modId];
      if (pm.day >= mod.days[0] && pm.day <= mod.days[1]) {
        mod.completedCount++;
        break;
      }
    }
  });

  return {
    candidate,
    member: candidate.member,
    signals: candidate.signals || {},
    passedMissions,
    strongDays,
    practiceDays: [...practiceDays, ...skippedDays],
    skippedDays,
    moduleProgress: Object.values(moduleMap),
  };
}
