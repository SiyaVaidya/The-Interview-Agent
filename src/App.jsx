import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import History from './pages/History';
import Analysis from './pages/Analysis';
import { getCandidates } from './services/dataService';

export default function App() {
  // Candidate selection state across app
  const candidates = getCandidates();
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    candidates[0]?.member?.id || 'CAND-001'
  );

  // Determine initial route, fallback to '/dashboard'
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (['/dashboard', '/interview', '/history', '/analysis'].includes(path)) {
      return path;
    }
    return '/dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom navigate function
  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentRoute(path);
  };

  // Render current active page
  const renderPage = () => {
    switch (currentRoute) {
      case '/interview':
        return (
          <Interview
            onNavigate={navigateTo}
            candidateId={selectedCandidateId}
          />
        );
      case '/history':
        return <History onNavigate={navigateTo} />;
      case '/analysis':
        return <Analysis onNavigate={navigateTo} />;
      case '/dashboard':
      default:
        return (
          <Dashboard
            onNavigate={navigateTo}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
          />
        );
    }
  };

  return (
    <>
      <Navbar currentRoute={currentRoute} onNavigate={navigateTo} />
      <main className="container">
        {renderPage()}
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} The Interview Agent &bull; Enterprise AI Cohort Hackathon Project</p>
      </footer>
    </>
  );
}
