import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  loading,
  error,
  onRetry,
  onToggleStatus,
  onEdit,
  onDelete,
  activeFilter,
  priorityFilter = 'all'
}) {
  if (loading) {
    return (
      <div className="task-state-container loading-state">
        <div className="spinner"></div>
        <p className="state-message">Fetching tasks from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-state-container error-state" role="alert">
        <div className="error-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="state-title">Something went wrong</h3>
        <p className="state-message">{error}</p>
        <button type="button" className="btn-primary btn-retry" onClick={onRetry}>
          🔄 Retry Loading
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-state-container empty-state">
        <div className="empty-illustration" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="state-title">No tasks found</h3>
        <p className="state-message">
          {priorityFilter !== 'all'
            ? `No ${priorityFilter.toLowerCase()} priority tasks found in this view.`
            : activeFilter === 'completed'
            ? 'No tasks completed yet. Keep going!'
            : activeFilter === 'pending'
            ? 'All tasks are completed! Enjoy your day.'
            : 'Your task list is empty. Create your first task using the form above!'}
        </p>
      </div>
    );
  }

  return (
    <ul className="task-list" aria-label="Tasks List">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
