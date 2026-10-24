import React, { useState } from 'react';

export default function TaskItem({ task, onToggleStatus, onEdit, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleStatus(task._id, !task.completed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Helper to format due date and calculate overdue / due today status
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDateClean = new Date(date);
    dueDateClean.setHours(0, 0, 0, 0);

    const isOverdue = !task.completed && dueDateClean.getTime() < today.getTime();
    const isDueToday = !task.completed && dueDateClean.getTime() === today.getTime();

    const formatted = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      text: formatted,
      isOverdue,
      isDueToday
    };
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  // Compute status modifier classes for highlighting
  const cardHighlightClass = dueDateInfo?.isOverdue
    ? 'card-overdue'
    : dueDateInfo?.isDueToday
    ? 'card-due-today'
    : '';

  const priorityLower = (task.priority || 'Medium').toLowerCase();

  return (
    <li
      className={`task-card ${task.completed ? 'completed' : ''} priority-border-${priorityLower} ${cardHighlightClass}`}
    >
      {/* Checkbox / Completion Toggle */}
      <div className="task-check-area">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={isToggling}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
          />
          <span className="checkmark"></span>
        </label>
      </div>

      {/* Task Content */}
      <div className="task-content">
        <div className="task-title-row">
          <h3 className={`task-title ${task.completed ? 'strike' : ''}`}>
            {task.title}
          </h3>
          {/* Feature 1: Priority clearly displayed */}
          <span className={`priority-badge priority-${priorityLower}`}>
            {task.priority === 'High' && '🔥 '}
            {task.priority === 'Medium' && '⚡ '}
            {task.priority === 'Low' && '🌱 '}
            {task.priority} Priority
          </span>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {/* Task Meta (Feature 2: Due Date, Overdue & Due Today highlights) */}
        <div className="task-meta">
          {dueDateInfo && (
            <span
              className={`meta-item due-date ${
                dueDateInfo.isOverdue
                  ? 'overdue'
                  : dueDateInfo.isDueToday
                  ? 'due-today'
                  : ''
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Due: {dueDateInfo.text}</span>
              {dueDateInfo.isOverdue && (
                <span className="overdue-tag">⚠️ Overdue</span>
              )}
              {dueDateInfo.isDueToday && (
                <span className="due-today-tag">📅 Due Today</span>
              )}
            </span>
          )}

          <span className="meta-item created-at">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
          </span>
        </div>
      </div>

      {/* Task Actions */}
      <div className="task-actions">
        <button
          type="button"
          className="btn-icon btn-edit"
          title="Edit task"
          onClick={() => onEdit(task)}
          disabled={task.completed}
          aria-label={`Edit ${task.title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <button
          type="button"
          className="btn-icon btn-delete"
          title="Delete task"
          onClick={() => setShowConfirmDelete(true)}
          aria-label={`Delete ${task.title}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h4 className="modal-title">Delete Task?</h4>
            <p className="modal-text">
              Are you sure you want to delete <strong>"{task.title}"</strong>? This will permanently remove it from your database.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
