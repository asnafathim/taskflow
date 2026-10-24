import React from 'react';

export default function Header({
  isOnline,
  dbConnected,
  user,
  onOpenLogin,
  onOpenSignup,
  onLogout
}) {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Group */}
        <div className="brand-group">
          <div className="logo-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div>
            <h1 className="app-title">TaskFlow</h1>
            <p className="app-subtitle">Organize your day, one task at a time.</p>
          </div>
        </div>

        {/* Right Nav / Controls */}
        <div className="header-actions">
          {/* System Status Pill */}
          <div className="system-status" title={`Database status: ${dbConnected ? 'Connected' : 'Disconnected'}`}>
            <span className={`status-indicator ${isOnline ? 'online' : 'checking'}`}></span>
            <span className="status-text">
              {isOnline
                ? dbConnected
                  ? '🍃 MongoDB Connected'
                  : '⚡ Server Online'
                : 'Connecting...'}
            </span>
          </div>

          {/* Auth Controls */}
          {user ? (
            <div className="user-profile-menu">
              <div className="user-pill" title={`Signed in as ${user.email}`}>
                <div className="user-avatar">{getInitials(user.name)}</div>
                <div className="user-info-text">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-logout"
                onClick={onLogout}
                title="Log out of TaskFlow"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="header-auth-buttons">
              <button
                type="button"
                className="btn btn-header-login"
                onClick={onOpenLogin}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-header-signup"
                onClick={onOpenSignup}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
