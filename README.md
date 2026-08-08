# The Interview Agent

The Interview Agent is a frontend-first hackathon project that simulates a technical interview experience for learners in an AI cohort. It combines a guided interview flow, structured feedback, candidate progress insights, and interview history into a single web app.

## Problem Statement

Many learners need a realistic way to practice technical interviewing without relying on a human interviewer every time. This project provides a lightweight experience that:

- introduces interview questions based on curriculum progress,
- evaluates the candidate’s responses in a structured way,
- stores completed interviews for later review,
- and helps users analyze strengths, gaps, and next steps.

## What Is Implemented

The current implementation is a React + Vite web application with the following capabilities:

- Dashboard for candidate selection and high-level progress overview
- Interview flow with an adaptive AI-style conversational experience
- Structured interview feedback at the end of the session
- Interview History page for reviewing prior sessions
- Analysis page with aggregate insights and interview summaries
- PDF download for the current interview summary/report

## Key Features

- Candidate-aware interview experience using local profile and curriculum data
- Interview flow with exactly 8 questions and a 5-minute timer per question
- Auto-submit when the timer expires
- Persistent interview history stored in browser localStorage
- Analysis view that aggregates candidate progress, strengths, gaps, and interview summaries
- PDF export of the interview summary report
- Lightweight routing between Dashboard, Interview, History, and Analysis pages

## How the AI Interviewer Works

The interview flow is implemented in the frontend with a local interview service layer.

### Current behavior

1. The user starts an interview from the Dashboard.
2. The app initializes a new session and presents the first question.
3. The user answers in the chat-style interface.
4. The app submits the answer to the interview service.
5. The service returns either:
   - the next follow-up or next question, or
   - a completion response with structured feedback after the 8th question.

The interview service uses the candidate’s curriculum and mission history to choose topic areas and build the interview sequence.

## Interview Flow

The current implementation uses the following interview structure:

- Maximum of 8 questions
- 5 minutes per question
- Questions auto-submit when the time expires
- The interview is marked complete once the final response is processed

The flow is implemented in [src/pages/Interview.jsx](src/pages/Interview.jsx) and [src/services/interviewApi.js](src/services/interviewApi.js).

## Query / Retrieval Architecture

The current version does not implement a separate backend retrieval pipeline or vector database.

Instead, the app uses:

- local curriculum and candidate data from [data/curriculum.json](data/curriculum.json) and [data/candidates.json](data/candidates.json)
- rule-based question sequencing based on candidate mission history and curriculum day coverage
- local interview state managed in the browser

If a backend API URL is configured, the app can attempt to send interview payloads to a remote endpoint via the VITE_API_URL environment variable. If that endpoint is unavailable, it falls back to the built-in local spec engine.

## AI / LLM Functionality

The app does not currently depend on a hosted LLM provider in the frontend code.

Implemented behavior includes:

- conversational interview prompting,
- structured feedback generation,
- adaptive follow-up logic,
- and analysis summaries.

The current implementation uses a local spec-driven engine rather than a live model API. A backend endpoint can optionally be used if configured.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite |
| Styling | Custom CSS and glass-card UI components |
| PDF Export | jsPDF |
| Data | JSON files in the data directory |
| Persistence | Browser localStorage |

## Project Structure

```text
src/
  App.jsx                # App shell and route handling
  main.jsx               # React entry point
  pages/
    Dashboard.jsx        # Candidate overview and CTA
    Interview.jsx        # Interview UI and timer logic
    History.jsx          # Saved interview history
    Analysis.jsx         # Aggregate analysis and summary view
  services/
    dataService.js       # Candidate and curriculum data access
    interviewApi.js      # Interview flow logic and feedback generation
    analysisService.js   # Analysis helpers and normalization
  components/
    Navbar.jsx           # Navigation bar
  assets/                # Static assets

public/
  static assets served by Vite

data/
  candidates.json        # Candidate data
  curriculum.json       # Curriculum/day structure
  technical-spec.md     # Interview API spec reference
```

## Setup and Installation

### Prerequisites

- Node.js and npm

### Install dependencies

```bash
npm install
```

## Configuration

The app uses the following optional configuration:

### Environment variables

The project supports an optional environment variable:

```bash
VITE_API_URL=http://localhost:3000
```

If VITE_API_URL is set and the backend endpoint is reachable, the interview service will attempt to use it. Otherwise it will use the built-in local interview engine.

## Running the Application

### Frontend

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Production build

```bash
npm run build
```

## Available Pages and Features

### Dashboard

- Select a candidate
- View mission and curriculum-based progress indicators
- Start a new interview
- Navigate to interview history

### Interview

- Start a new interview session
- Answer eight questions in sequence
- See a 5-minute per-question timer
- Receive structured feedback at completion

### History

- Review completed interviews from localStorage
- See date, duration, score, and feedback details
- Delete or clear interview history

### Analysis

- Review aggregated candidate performance
- View curriculum progress and skill-based insights
- View interview summary rows for completed interviews
- Download the current interview analysis as a PDF

## PDF Download Functionality

The Analysis page includes a Download as PDF button. When clicked, the app generates a PDF report containing:

- candidate name and role
- interview date and details
- overall score
- assessment summary
- strengths and weaknesses
- recommended next steps
- question-by-question results when available
- aggregate summary context

The export uses the jsPDF library.

## Important Implementation Notes

- The project is currently frontend-focused and uses browser localStorage for persistence.
- There is no separate backend service implemented in this repository for interview execution.
- The current AI-style interview experience is driven by local logic and optional backend integration.
- The app is intended for hackathon/demo use rather than production deployment.

## Future Improvements

Possible next steps for the project include:

- connecting the interview experience to a real LLM backend,
- adding persistent server-side storage,
- improving question generation with richer retrieval or semantic ranking,
- and expanding the analysis experience with richer charts and deeper insights.
