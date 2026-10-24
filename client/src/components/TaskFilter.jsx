import React from 'react';

export default function TaskFilter({
  activeFilter,
  onFilterChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  counts = {}
}) {
  const statusFilters = [
    { id: 'all', label: 'All Tasks', count: counts.all ?? 0 },
    { id: 'pending', label: 'Pending', count: counts.pending ?? 0 },
    { id: 'completed', label: 'Completed', count: counts.completed ?? 0 }
  ];

  const priorityFilters = [
    { id: 'all', label: 'All Priorities', count: counts.all ?? 0 },
    { id: 'High', label: '🔥 High', count: counts.high ?? 0 },
    { id: 'Medium', label: '⚡ Medium', count: counts.medium ?? 0 },
    { id: 'Low', label: '🌱 Low', count: counts.low ?? 0 }
  ];

  return (
    <div className="task-filter-container">
      {/* 1. Status Filter Tabs (All / Pending / Completed) */}
      <div className="filter-tabs" role="tablist" aria-label="Task Status Filters">
        {statusFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter.id}
            className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className="tab-label">{filter.label}</span>
            <span className="tab-badge">{filter.count}</span>
          </button>
        ))}
      </div>

      {/* 2. Priority Filter Bar (Feature 1: Filter tasks by High, Medium, Low) */}
      <div className="priority-filter-bar">
        <span className="priority-filter-label">Priority:</span>
        <div className="priority-filter-group" role="group" aria-label="Task Priority Filters">
          {priorityFilters.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`priority-filter-chip priority-chip-${p.id.toLowerCase()} ${
                priorityFilter === p.id ? 'active' : ''
              }`}
              onClick={() => onPriorityFilterChange && onPriorityFilterChange(p.id)}
            >
              <span>{p.label}</span>
              <span className="chip-count">({p.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
