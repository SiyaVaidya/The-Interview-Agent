# PROMPTS.md

### Prompt 1 - User Dashboard
> Build the **User Dashboard** for our hackathon project **"The Interview Agent"**.

## Project Context

We are building an **AI Interview Agent** for a 31-day enterprise AI engineering cohort.

The cohort covers:

* Retrieval-Augmented Generation (RAG)
* Vector Databases
* Prompt Engineering
* Agentic AI
* Model Context Protocol (MCP)
* AI Deployment
* Production AI Systems

The purpose of the application is to conduct a **personalized, realistic, multi-turn technical interview** based on each candidate's learning journey.

The hackathon provides:

1. **Curriculum JSON**

   * Modules
   * Daily topics
   * Learning objectives
   * Tools used

2. **Candidate Profiles**

   * Completed missions
   * Attempts
   * Skipped topics
   * Learning signals

3. **Technical Specification**

   * Required API contract
   * Request/response formats
   * Submission requirements

The AI interviewer must eventually:

* Ask at least 8 questions
* Cover at least 4 curriculum days
* Generate intelligent follow-up questions
* Maintain conversation context
* Produce structured feedback

## Your Task

Build ONLY the **User Dashboard**.

Do not build the Interview Page yet.

The dashboard is the candidate's starting point after opening the application.

---

## Dashboard Requirements

### 1. Navigation

Create a clean navigation bar containing:

**The Interview Agent**

Navigation links:

* Dashboard
* Interview
* History

Routes:

```text
/dashboard
/interview
/history
```

The Interview and History pages will be implemented separately, so only create navigation links to them.

---

### 2. Welcome Section

Display:

**"Welcome back, [Candidate Name]"**

Supporting text:

"Prepare for a personalized technical interview based on your AI engineering learning journey."

The dashboard should communicate that this is NOT a generic interview system.

---

### 3. Start Interview Card

Create the main CTA:

**"Ready for your technical interview?"**

Description:

"Your AI interviewer will evaluate your understanding of the concepts you've learned throughout the cohort and adapt its questions based on your responses."

Button:

**Start Interview →**

Navigate to:

```text
/interview
```

Make this the primary action on the page.

---

### 4. Interview Statistics

Create simple cards for:

* Interviews Completed
* Average Score
* Best Score
* Topics Practiced

Use mock data for now.

Example:

```text
Interviews Completed: 4
Average Score: 78%
Best Score: 89%
Topics Practiced: 12
```

These values will later come from the backend.

---

### 5. Learning Journey Section

Because personalization is central to the hackathon, show a small section representing the candidate's learning journey.

Example:

**Your Interview Focus**

Strong Areas:

* RAG
* Prompt Engineering

Areas to Practice:

* Vector Databases
* MCP

Use mock data for now.

Do not implement AI logic in the dashboard.

---

### 6. Recent Interview

Show the latest interview:

* Date
* Score
* Topics
* View Details button

Example:

```text
Latest Interview
82%

RAG • Vector Databases • Prompt Engineering

August 8, 2026

[View Details]
```

The View Details button can navigate to:

```text
/history
```

---

## Design

Create a polished, modern AI/SaaS interface.

Use:

* Clean typography
* Professional layout
* Rounded cards
* Subtle gradients
* Good spacing
* Clear visual hierarchy
* Responsive design
* Subtle hover effects

The visual identity should communicate:

**AI + Technical Interview + Personalization + Professional**

Avoid:

* Generic student dashboard styling
* Excessive colors
* Excessive animations
* Unnecessary widgets
* Fake functionality

---

## Team Development Rules

This is a 3-person team.

Other teammates will build:

**Analysis Page**

* Performance
* Skills
* Graphs
* AI feedback
* PDF report

**Interview History**

* Previous interviews
* Interview details
* View analysis

Therefore, keep this dashboard modular and do not implement those features.

Use mock data where necessary.

Before coding:

1. Inspect the existing project.
2. Reuse existing components and styling.
3. Do not unnecessarily change unrelated files.
4. Do not install unnecessary dependencies.
5. Keep routing compatible with the existing project.

Build only the User Dashboard and the shared navigation/layout required for it.


### Prompt 2 - Interview Page
> Build the **Interview Page** for our hackathon project **"The Interview Agent"**.

## Project Context

We are building an **AI Interview Agent** for a 31-day enterprise AI engineering cohort.

The cohort covers:

* Retrieval-Augmented Generation (RAG)
* Vector Databases
* Prompt Engineering
* Agentic AI
* Model Context Protocol (MCP)
* AI Deployment
* Production AI Systems

The goal is NOT to create a scripted questionnaire.

The goal is to create a **realistic, conversational, multi-turn technical interview** where the AI interviewer understands the candidate's learning journey and adapts its questions based on their answers.

The hackathon provides:

### Curriculum JSON

Contains:

* Modules
* Daily topics
* Learning objectives
* Tools used

### Candidate Profiles

Contains:

* Completed missions
* Attempts
* Skipped topics
* Learning signals

### Technical Specification

Defines:

* Required HTTP endpoint
* API contract
* Request/response formats
* Submission requirements

The minimum requirements are:

* At least 8 questions
* At least 4 different curriculum days
* Intelligent follow-up questions
* Conversation context
* Structured feedback at the end
* Required HTTP endpoint

---

# Your Task

Build the **Interview Page / Interview Experience**.

This page should feel like a real technical interview rather than a form or static questionnaire.

---

# Interview Flow

The intended flow is:

```text
Start Interview
      ↓
Candidate Information / Interview Setup
      ↓
AI asks Question
      ↓
Candidate answers
      ↓
AI evaluates response internally
      ↓
AI decides next question / follow-up
      ↓
Candidate answers again
      ↓
Repeat
      ↓
Minimum 8 questions
      ↓
Interview Complete
      ↓
Analysis / Feedback
```

The actual AI/backend integration can initially use mock data if the backend is not ready.

Do NOT create a fake scripted interview that always asks the same questions.

Structure the UI so it can later connect to the real AI agent.

---

# Interview Page UI

### 1. Interview Header

Display:

**The Interview Agent**

Show:

* Interview progress
* Question number
* Example: `Question 3 of 8+`
* Optional topic being assessed

Example:

```text
Technical Interview

Question 3 of 8+

Topic: Retrieval-Augmented Generation
```

---

### 2. AI Interviewer Message

Create a conversational interviewer area.

Example:

```text
AI Interviewer

"Let's talk about RAG.

Can you explain why retrieval is useful
when building an enterprise AI system?"
```

The AI question should look conversational rather than like a multiple-choice question.

---

### 3. Candidate Answer Area

Create a large text input:

```text
Type your answer here...
```

Button:

**Submit Answer →**

Also support:

* Entering multi-line answers
* Clear input
* Loading state after submission
* Disabled submit button when empty

---

### 4. Conversation Context

Display previous questions and answers in a clean conversational format.

Example:

```text
AI Interviewer
Explain RAG...

You
RAG combines retrieval with generation...

AI Interviewer
Good. How would you handle...
```

The candidate should be able to see enough previous conversation to understand the context.

---

### 5. Adaptive Follow-up State

When the AI generates a follow-up question, display it naturally.

For example:

```text
AI Interviewer

"Good explanation.

You mentioned vector databases.
Why would you choose a vector database
instead of a traditional relational database
for semantic retrieval?"
```

The UI should not explicitly reveal internal AI reasoning.

---

### 6. Progress

Show a progress indicator.

Example:

```text
Interview Progress

████████░░░░░░░░

4 / 8+
```

Important:

The challenge requires **at least 8 questions**, but the AI may continue asking additional questions when necessary.

Therefore, don't design the UI as if the interview must always end exactly at question 8.

---

### 7. Interview Completion

After the AI determines that the interview is complete, show:

**Interview Complete**

Supporting message:

"Your interview has been completed. Your performance analysis is being prepared."

Button:

**View Analysis →**

Navigate to:

```text
/analysis
```

The Analysis page will be built by another teammate.

---

# Important AI Behavior

The frontend should be designed around these requirements:

### Personalization

Questions should eventually be generated using:

* Candidate profile
* Completed missions
* Skipped topics
* Learning signals
* Curriculum topics

### Adaptation

If the candidate gives a strong answer:

```text
Strong answer
↓
Harder/deeper follow-up
```

If the candidate struggles:

```text
Weak answer
↓
Clarifying/basic follow-up
```

### Context

The AI must remember:

* Previous questions
* Previous answers
* Topics discussed
* Candidate performance
* Questions already asked

### Coverage

The interview must eventually cover:

* At least 8 questions
* At least 4 curriculum days

The frontend should therefore support dynamic question counts and changing topics.

---

# Mock Data

If the backend/AI agent is not yet connected, create a clean mock service/data layer rather than hardcoding questions directly inside UI components.

Example structure:

```text
services/
    interviewApi.js

mock/
    interviewData.js
```

The mock service should simulate:

```text
startInterview()
submitAnswer()
getNextQuestion()
finishInterview()
```

Later these functions can be replaced with real API calls without rebuilding the UI.

---

# Design

The interview should feel:

* Professional
* Conversational
* Focused
* Modern
* AI-powered
* Similar to a real technical interview

Use:

* Clean chat-style conversation
* Clear AI/candidate distinction
* Large readable question text
* Comfortable answer area
* Progress indicator
* Subtle animations/loading states
* Responsive layout

Avoid:

* Multiple-choice-question styling
* Game-like UI
* Excessive animations
* Unnecessary decorative elements
* Making it look like a generic chatbot

The main focus should always be:

**Question → Candidate Thinking → Answer → Intelligent Follow-up**

---

# Team Development Rules

This page is being built by one team member while others build:

**Analysis Page**

* Scores
* Performance graph
* Skill evaluation
* AI feedback
* PDF

**Interview History**

* Previous interviews
* Interview details
* View analysis

Do not implement those pages.

Only create the navigation/link to `/analysis` after the interview is complete.

Before coding:

1. Inspect the existing project structure.
2. Reuse existing components/styles.
3. Reuse the dashboard navigation created earlier.
4. Do not unnecessarily modify unrelated files.
5. Do not install unnecessary dependencies.
6. Keep the interview components modular.
7. Keep API calls in a separate service layer.
8. Use mock data if the backend is not ready.

The final Interview Page should be ready to connect to the real AI Interview Agent backend later.


### Prompt 3 - According to Attached Resources
> Now that the official hackathon resources are available in the `data/` folder, use them to integrate the existing **User Dashboard + Interview Page** with the actual project requirements.

### Files to inspect

Read these files from the `data/` folder:

* Curriculum JSON
* Candidate Profiles
* Technical Specification

First, understand their structure and contents before making changes.

### Important

I have already implemented the **User Dashboard and Interview Page**.

**Do NOT rebuild or redesign the existing UI.**

Do not open, launch, or test the application in a browser. **I will open the browser and test it myself.**

Do not implement:

* Analysis Page
* Interview History Page
* Authentication
* Voice interaction
* Persistent user accounts

### What I want you to do

#### 1. Understand the Candidate Profiles

Identify how the candidate data represents:

* Completed missions
* Attempts
* Skipped topics
* Learning signals

Use this information to make the interview personalized to the selected candidate.

#### 2. Understand the Curriculum

Identify:

* Curriculum days
* Modules
* Topics
* Learning objectives
* Tools

The interview should eventually ask questions based on what the candidate actually learned.

#### 3. Understand the Technical Specification

Carefully identify:

* Required HTTP endpoint
* Request format
* Response format
* Required fields
* Any other implementation requirements

Do not invent an API contract if one is already specified.

#### 4. Integrate the Interview Page

Connect the existing Interview Page to the candidate and curriculum data.

The interview architecture should support:

```text
Candidate Profile
       ↓
Learning Journey
       ↓
Relevant Curriculum Topics
       ↓
Initial Question
       ↓
Candidate Answer
       ↓
Answer Evaluation
       ↓
Adaptive Follow-up
       ↓
Next Question
       ↓
At least 8 Questions
       ↓
At least 4 Curriculum Days
       ↓
Final Structured Feedback
```

The interview must be conversational and adaptive, not a fixed list of questions.

#### 5. Maintain Context

The interview should maintain:

* Previous questions
* Previous answers
* Topics already covered
* Candidate performance
* Follow-up decisions

Avoid asking the same question repeatedly.

#### 6. Preserve the existing UI

Keep the current User Dashboard and Interview Page design.

Only make changes necessary to connect the real data and interview functionality.

Keep the implementation modular so other teammates can later add:

```text
Analysis Page
Interview History
```

without breaking this work.

#### 7. Mock vs Real API

If the required backend/API is not implemented yet, create a clean service layer so the frontend can work with mock data temporarily.

Do not hardcode the curriculum or candidate information directly into UI components.

Keep data access separate, for example:

```text
data/
services/
components/
pages/
```

### Before coding

First inspect:

1. Existing project structure
2. `data/` files
3. Current User Dashboard
4. Current Interview Page

Then briefly identify what needs to be changed.

After that, implement only the necessary changes.

Do not make unrelated improvements or install unnecessary packages.


### Prompt 4 - Changing color schema
> Improve the color theme of the existing User Dashboard to make it look like a professional, modern AI SaaS / enterprise technical interview platform.

IMPORTANT:
- Do NOT redesign the layout.
- Do NOT remove or rearrange existing sections.
- Do NOT change the functionality.
- Do NOT change the content or data.
- Do NOT open or launch the browser. I will test it myself.
- Only improve the visual color system, contrast, borders, backgrounds, buttons, cards, and typography colors.

CURRENT ISSUE:
The current dashboard uses a dark navy background with large mustard/gold cards. The mustard/gold color is too dominant and makes the dashboard look less professional.

NEW VISUAL DIRECTION:
Use a premium enterprise AI/SaaS color palette.

Recommended palette:

Background:
- Main background: #080B16 or #0B1020
- Secondary sections: #10162A
- Card background: #12182B / #151C32

Primary accent:
- Indigo/Violet: #6366F1
- Bright purple accent: #7C3AED
- Subtle purple gradient: #6366F1 → #8B5CF6

Text:
- Primary text: #F8FAFC
- Secondary text: #A7B0C0
- Muted text: #6B7280

Borders:
- Subtle border: rgba(255,255,255,0.08)
- Active border: rgba(99,102,241,0.5)

Success:
- Green: #22C55E

Warning:
- Amber: #F59E0B

IMPORTANT COLOR CHANGES:
1. Remove the large mustard/gold backgrounds from the statistics cards.
2. Replace them with dark/slate cards with subtle borders.
3. Use purple/indigo only as an accent, not as the entire background.
4. Keep the Start Interview button as the strongest visual CTA using an indigo/purple gradient.
5. Use green only for positive indicators such as completed missions or strong areas.
6. Use amber only for "Areas to Practice" or warning indicators.
7. Do not use bright yellow/gold as a dominant UI color.

CARD STYLE:
- Dark/slate background
- Very subtle border
- Soft shadow
- 14–18px rounded corners
- Slight hover effect
- Consistent card styling throughout the dashboard

STATISTICS CARDS:
Instead of mustard cards, use dark cards like:

Background: #12182B
Border: rgba(255,255,255,0.08)
Number: white
Label: muted slate
Optional small purple accent/icon

START INTERVIEW CARD:
Make this the visual focal point.

Use:
- Dark card background
- Subtle purple/indigo glow
- Purple left border or accent
- Strong white heading
- Muted description
- Indigo/purple gradient CTA button

INTERVIEW FOCUS SECTION:
Use a dark card background.

Strong Areas:
- Green check icon
- Subtle green-tinted badge

Areas to Practice:
- Amber warning icon
- Subtle amber-tinted badge

Do NOT make the entire section green or amber.

LATEST ASSESSMENT:
Use the same dark card style.
Make the score visually prominent with an indigo/purple accent.
Use green only if the score/status is positive.

NAVBAR:
Keep the dark background.
Make the active Dashboard link use the indigo/purple accent.
Keep inactive navigation items muted.
Add a subtle bottom border.

OVERALL LOOK:
The final dashboard should feel similar to a premium:
- AI SaaS platform
- Enterprise developer tool
- Technical interview platform
- Modern AI engineering product

It should look sophisticated, clean, calm, and professional rather than colorful or gamified.

Maintain WCAG-friendly text contrast.

Use the existing design system/components where possible.
Create centralized color variables/tokens if the project already uses CSS variables or a theme system, so the same theme can easily be reused by the Interview, Analysis, and History pages later.

Again:
ONLY change the visual theme and styling.
DO NOT change the existing layout, functionality, routing, data, or content.
DO NOT open the browser.

### Prompt 5 - Fixing Interview Page layout
> I want you to properly fix and polish the existing Interview Page layout.

I have provided a screenshot showing the current Interview Page. Use the screenshot as a visual reference for the problems that need to be fixed.

IMPORTANT:
- Do NOT open or launch the browser. I will test it myself.
- Do NOT change the interview functionality or AI logic.
- Do NOT change the existing data.
- Do NOT change the routes.
- Do NOT redesign the entire application.
- Focus on fixing the Interview Page layout, spacing, responsiveness, readability, and visual hierarchy.
- Inspect the existing code first and modify the existing components rather than creating unnecessary duplicate components.

## CURRENT PROBLEMS TO FIX

### 1. Interview content is clipped

The current AI interviewer message is partially hidden/cut off at the top.

Fix this properly.

The conversation/question container must have enough top spacing and must never hide text.

Do NOT solve this by simply increasing the height of random elements.

Check for:
- overflow: hidden
- fixed heights
- incorrect positioning
- negative margins
- flex container sizing
- header overlap
- scrolling container issues

Make sure the complete AI question is always visible.

---

### 2. Improve the overall page structure

Use a professional interview layout:

```text
┌─────────────────────────────────────────────┐
│ Header / Navigation                         │
├─────────────────────────────────────────────┤
│                                             │
│ Interview title + candidate                 │
│ Progress + current topic                    │
│                                             │
│ ───────────── progress bar ──────────────  │
│                                             │
│ AI Interviewer                              │
│ ┌─────────────────────────────────────────┐ │
│ │ AI question / conversation              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Candidate Response                          │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │ Type your answer...                     │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                              Submit Answer   │
│                                             │
└─────────────────────────────────────────────┘

### Prompt 6 - Performance Analysis Page Structure
> Build a professional, data-driven Performance Analysis page that summarizes an interview session, highlights strengths and weaknesses, and provides actionable recommendations for the candidate.

Purpose
- Provide a clear, concise summary of an interview session for candidates and reviewers.
- Surface quantitative and qualitative signals: score, competency breakdown, time metrics, and AI feedback.

Audience
- Candidates seeking detailed feedback.
- Mentors / reviewers who need quick insights.

Data sources
- Interview result object (per-interview): questions, answers, timestamps, scores, model feedback.
- Candidate profile: learning journey, completed modules, prior attempts.
- Curriculum metadata: topic → day mapping, learning objectives.

Required metrics & KPIs
- Overall Score: single numeric (0–100) with interpretation band (Excellent / Good / Needs Improvement).
- Topic Coverage: number of curriculum days covered and percent coverage.
- Accuracy / Correctness Rate: percent of answers marked correct or meeting rubric thresholds.
- Depth Score: measure of answer depth/complexity (e.g., 0–5) averaged across questions.
- Time Per Question: median and distribution, highlighting long/short answers.
- Follow-up Rate: percent of answers that triggered deeper follow-ups.
- Consistency: variance of scores across topics (spot oscillations).

Visual layout (recommended blocks)
- Header: interview title, candidate name, date, duration, `View Raw Transcript` / `Export PDF` actions.
- Top summary cards (row): Overall Score, Time Per Question, Topics Covered, Questions Asked.
- Score trend (line chart): if comparing multiple interviews or showing question-by-question progression.
- Competency heatmap / radar: axes for core competencies (RAG, Vector DBs, Prompt Engineering, MCP, etc.).
- Topic bar chart: score by topic or curriculum day with color-coded performance bands.
- Question table: paginated list with question text, candidate answer excerpt, score, time spent, and model feedback snippet.
- AI feedback panel: aggregated qualitative feedback and 2–3 actionable recommendations.
- Export & compare controls: compare this interview to previous ones, or export CSV/PDF.

Interactions
- Hover tooltips on charts for exact values and explanation of metrics.
- Filter by date range, curriculum day, topic, or difficulty band.
- Drill into a topic to view all related questions and sample model feedback.
- Toggle between absolute scores and percentile ranking (relative to mock cohort data).

Accessibility & design
- Maintain high contrast, readable typography, and keyboard navigation for the table and controls.
- Provide screen-reader friendly labels for charts and export buttons.

API / Mock contract (frontend-friendly)
- GET /api/analysis/{interviewId}
      - Response: {
                  interviewId: string,
                  candidateId: string,
                  date: ISO8601,
                  durationSeconds: number,
                  overallScore: number,
                  topicsCovered: [{topicId, name, score, questionsCount}],
                  questions: [{questionId, text, topicId, score, timeSeconds, modelFeedback}],
                  aiSummary: {strengths: [string], improvements: [string], comments: string}
            }

Mock response example (minimal)
{
      "interviewId": "intv_123",
      "candidateId": "cand_456",
      "date": "2026-08-08T14:22:00Z",
      "durationSeconds": 1800,
      "overallScore": 82,
      "topicsCovered": [{"topicId":"t1","name":"RAG","score":88,"questionsCount":3}],
      "questions": [{"questionId":"q1","text":"Explain RAG","topicId":"t1","score":85,"timeSeconds":240,"modelFeedback":"Good explanation; add enterprise constraints."}],
      "aiSummary": {"strengths":["Concise explanations"],"improvements":["Deeper system design examples"],"comments":"Overall strong; recommend reviewing vector DB tradeoffs."}
}

Implementation notes
- Keep analysis logic in `services/analysisService.js` and use mock data under `mock/` until backend is ready.
- Visuals should reuse existing charting components or use a lightweight chart library already allowed in the project. If no library exists, export data-ready structures so a different teammate can wire charts later.
- Ensure the page supports server-driven PDFs (export endpoint) but provide a client-side CSV/JSON export fallback.

Team rules
- Do not modify Interview or Dashboard behavior; Analysis is read-only with respect to interview data.
- Keep components modular and export props-driven components for reuse on the History page.

Deliverable
- A polished, well-documented prompt in `PROMPTS.md` that the design/development team can follow to implement the Performance Analysis page.


