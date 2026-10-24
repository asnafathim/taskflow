import React from 'react';

export default function DashboardSummary({ tasks = [] }) {
  // Feature 3: Calculate values from current user's actual tasks
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Feature 2: Calculate overdue and due today statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueTodayCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }).length;

  const overdueCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  }).length;

  return (
    <section className="dashboard-summary" aria-label="Task Summary">
      {/* 1. Total Tasks */}
      <div className="stat-card total-card">
        <div className="stat-icon" aria-hidden="true">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Tasks</span>
          <span className="stat-number">{total}</span>
        </div>
      </div>

      {/* 2. Pending Tasks */}
      <div className="stat-card pending-card">
        <div className="stat-icon" aria-hidden="true">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-label">Pending</span>
          <span className="stat-number">{pending}</span>
        </div>
      </div>

      {/* 3. Completed Tasks */}
      <div className="stat-card completed-card">
        <div className="stat-icon" aria-hidden="true">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-label">Completed</span>
          <span className="stat-number">{completed}</span>
        </div>
      </div>

      {/* 4. Completion Rate & Due Alert Badges */}
      <div className="stat-card progress-card">
        <div className="stat-header">
          <span className="stat-label">Completion Rate</span>
          <span className="stat-percentage">{percentage}%</span>
        </div>
        <div
          className="progress-bar-container"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>

        {/* Due Date Indicator Pills */}
        <div className="dashboard-due-status">
          {overdueCount > 0 && (
            <span className="due-pill overdue-pill" title={`${overdueCount} task(s) overdue`}>
              ⚠️ {overdueCount} Overdue
            </span>
          )}
          {dueTodayCount > 0 && (
            <span className="due-pill due-today-pill" title={`${dueTodayCount} task(s) due today`}>
              📅 {dueTodayCount} Due Today
            </span>
          )}
          {overdueCount === 0 && dueTodayCount === 0 && total > 0 && (
            <span className="due-pill on-schedule-pill">
              ✨ All tasks on schedule
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
