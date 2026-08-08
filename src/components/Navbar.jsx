import React from 'react';

export default function Navbar({ currentRoute, onNavigate }) {
  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Interview', path: '/interview' },
    { name: 'History', path: '/history' },
  ];

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/dashboard" className="navbar-brand" onClick={(e) => handleLinkClick(e, '/dashboard')}>
          The Interview Agent
        </a>
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                className={`navbar-link ${currentRoute === link.path ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, link.path)}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
