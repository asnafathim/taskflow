import React from 'react';

export default function AuthBanner({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="auth-banner-card">
      <div className="auth-banner-content">
        <div className="auth-banner-badge">🔒 Secure Multi-User Task Workspace</div>
        <h2 className="auth-banner-title">
          Sign in to organize your tasks with <span className="gradient-text">TaskFlow</span>
        </h2>
        <p className="auth-banner-desc">
          Create an account to keep your personal tasks, priorities, and deadlines organized and securely saved to the cloud.
        </p>

        <div className="auth-banner-features">
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🛡️</span>
            <span>Private & protected tasks for your account</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">⚡</span>
            <span>Fast priorities & due-date filters</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">📊</span>
            <span>Live completion statistics & progress</span>
          </div>
        </div>

        <div className="auth-banner-actions">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onOpenSignup}
          >
            Create Free Account
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={onOpenLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
