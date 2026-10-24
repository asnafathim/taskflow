import React, { useState, useEffect, useRef } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  const titleInputRef = useRef(null);

  // Auto-focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Format Date to YYYY-MM-DD
  const formatDateString = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Quick Date presets for fast input
  const setQuickDate = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setDueDate(formatDateString(d));
  };

  // Populate form if an existing task is selected for editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'Medium');
      if (editingTask.dueDate) {
        setDueDate(formatDateString(new Date(editingTask.dueDate)));
      } else {
        setDueDate('');
      }
      setError('');
      titleInputRef.current?.focus();
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setError('');
    setTimeout(() => titleInputRef.current?.focus(), 10);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length > 150) {
      setError('Task title cannot exceed 150 characters.');
      return;
    }

    setError('');

    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      priority
    };

    const success = await onSubmit(payload);
    if (success && !editingTask) {
      resetForm();
    }
  };

  return (
    <div className="task-form-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
        </h2>
        {editingTask && (
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {error && (
        <div className="form-error-banner" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title Field with instant Enter key submission */}
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            ref={titleInputRef}
            type="text"
            className={`form-input ${error ? 'input-error' : ''}`}
            placeholder="e.g., Prepare Final Project Presentation Slides (Press Enter to save)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            maxLength={150}
            required
            disabled={isSubmitting}
          />
          <span className="character-count">{title.length}/150</span>
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">
            Description <span className="optional-tag">(Optional)</span>
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            placeholder="Add relevant notes, links, or sub-tasks..."
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            disabled={isSubmitting}
          ></textarea>
        </div>

        {/* Due Date & Priority Grid */}
        <div className="form-row">
          <div className="form-group flex-1">
            <div className="due-date-header">
              <label htmlFor="task-due-date" className="form-label">
                Due Date <span className="optional-tag">(Optional)</span>
              </label>
              {/* Fast 1-click date presets */}
              <div className="quick-date-chips">
                <button
                  type="button"
                  className="btn-quick-date"
                  onClick={() => setQuickDate(0)}
                  title="Due Today"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="btn-quick-date"
                  onClick={() => setQuickDate(1)}
                  title="Due Tomorrow"
                >
                  Tomorrow
                </button>
                {dueDate && (
                  <button
                    type="button"
                    className="btn-quick-date clear"
                    onClick={() => setDueDate('')}
                    title="Remove date"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <input
              id="task-due-date"
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group flex-1">
            <label className="form-label">Priority</label>
            <div className="priority-options">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  type="button"
                  key={level}
                  className={`priority-chip priority-${level.toLowerCase()} ${
                    priority === level ? 'active' : ''
                  }`}
                  onClick={() => setPriority(level)}
                  disabled={isSubmitting}
                >
                  {level === 'High' && '🔥 '}
                  {level === 'Medium' && '⚡ '}
                  {level === 'Low' && '🌱 '}
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-small"></span> Saving Task...
              </span>
            ) : editingTask ? (
              'Save Changes'
            ) : (
              '⚡ Add Task'
            )}
          </button>
          {!editingTask && (
            <button
              type="button"
              className="btn-secondary"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
