import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DashboardSummary from './components/DashboardSummary';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import TaskList from './components/TaskList';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AuthBanner from './components/AuthBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  getTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  checkHealth
} from './services/api';

function TaskFlowApp() {
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all'); // Feature 1: 'all' | 'High' | 'Medium' | 'Low'
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Auth modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Helper to show temporary toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 2200);
  }, []);

  // Check backend server health
  const verifyHealth = useCallback(async () => {
    try {
      const res = await checkHealth();
      setIsOnline(true);
      setDbConnected(res.database === 'connected');
    } catch {
      setIsOnline(false);
      setDbConnected(false);
    }
  }, []);

  // Fetch all tasks for current authenticated user
  const fetchAllTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getTasks('all');
      setTasks(response.data || []);
      setIsOnline(true);
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend server.');
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    verifyHealth();
  }, [verifyHealth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllTasks();
    } else {
      setTasks([]);
      setEditingTask(null);
    }
  }, [isAuthenticated, fetchAllTasks]);

  // Open auth modal helpers
  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (msg) => {
    showToast(msg || 'Welcome to TaskFlow!', 'success');
  };

  const handleLogout = () => {
    logout();
    setTasks([]);
    setEditingTask(null);
    setActiveFilter('all');
    setPriorityFilter('all');
    showToast('You have been logged out safely.', 'success');
  };

  // Handle Form Submission (Add or Update) with instant Optimistic UI update
  const handleSubmitTask = async (formData) => {
    if (!isAuthenticated) {
      handleOpenLogin();
      showToast('Please log in or register to manage your tasks.', 'error');
      return false;
    }

    if (editingTask) {
      // Optimistic edit: update immediately in UI (0ms)
      const originalTask = editingTask;
      const updatedSnapshot = { ...originalTask, ...formData, updatedAt: new Date().toISOString() };

      setTasks((prev) =>
        prev.map((t) => (t._id === originalTask._id ? updatedSnapshot : t))
      );
      setEditingTask(null);
      showToast('Task updated successfully!', 'success');

      updateTask(originalTask._id, formData).catch((err) => {
        // Rollback on error
        setTasks((prev) =>
          prev.map((t) => (t._id === originalTask._id ? originalTask : t))
        );
        showToast(err.message || 'Failed to update task.', 'error');
      });
      return true;
    } else {
      // Optimistic creation: prepend immediately to task list (0ms)
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const optimisticTask = {
        _id: tempId,
        ...formData,
        completed: false,
        createdAt: new Date().toISOString()
      };

      setTasks((prev) => [optimisticTask, ...prev]);
      showToast('Task added successfully!', 'success');

      createTask(formData)
        .then((response) => {
          // Replace temporary ID with persisted MongoDB doc ID
          setTasks((prev) =>
            prev.map((t) => (t._id === tempId ? response.data : t))
          );
        })
        .catch((err) => {
          // Remove optimistic task on failure
          setTasks((prev) => prev.filter((t) => t._id !== tempId));
          showToast(err.message || 'Failed to create task.', 'error');
        });

      return true;
    }
  };

  // Handle Complete / Incomplete Toggle with instant Optimistic UI update
  const handleToggleStatus = async (id, newCompletedState) => {
    if (!isAuthenticated) {
      handleOpenLogin();
      return;
    }

    // Instantly update UI without waiting for network roundtrip (0ms response)
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: newCompletedState } : t))
    );

    try {
      const response = await toggleTaskStatus(id, newCompletedState);
      // Synchronize exact server response
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? response.data : t))
      );
      showToast(
        newCompletedState
          ? '🎉 Great job! Task marked as completed.'
          : 'Task reopened as pending.',
        'success'
      );
    } catch (err) {
      // Revert optimistic update on error
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: !newCompletedState } : t))
      );
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // Handle Task Deletion with instant Optimistic UI update
  const handleDeleteTask = async (id) => {
    if (!isAuthenticated) {
      handleOpenLogin();
      return;
    }

    // Capture snapshot for instant rollback if server fails
    let deletedTask = null;
    let originalIndex = -1;

    setTasks((prev) => {
      originalIndex = prev.findIndex((t) => t._id === id);
      deletedTask = prev[originalIndex];
      return prev.filter((t) => t._id !== id);
    });

    if (editingTask && editingTask._id === id) {
      setEditingTask(null);
    }

    try {
      await deleteTask(id);
      showToast('Task deleted successfully.', 'success');
    } catch (err) {
      // Revert deletion on error
      if (deletedTask) {
        setTasks((prev) => {
          const restored = [...prev];
          restored.splice(originalIndex, 0, deletedTask);
          return restored;
        });
      }
      showToast(err.message || 'Failed to delete task.', 'error');
    }
  };

  // Trigger edit mode
  const handleEditTask = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Compute counts for dashboard and filter badges (Status + Feature 1 Priority)
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    high: tasks.filter((t) => t.priority === 'High').length,
    medium: tasks.filter((t) => t.priority === 'Medium').length,
    low: tasks.filter((t) => t.priority === 'Low').length
  };

  // Filter tasks based on both active status tab and priority filter
  const filteredTasks = tasks.filter((t) => {
    // 1. Status Filter
    if (activeFilter === 'pending' && t.completed) return false;
    if (activeFilter === 'completed' && !t.completed) return false;

    // 2. Feature 1: Priority Filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    return true;
  });

  // App initialization loading view
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner"></div>
        <p>Loading TaskFlow...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        isOnline={isOnline}
        dbConnected={dbConnected}
        user={user}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {!isAuthenticated ? (
          // Guest View: Auth Banner & Call to action
          <>
            <AuthBanner
              onOpenLogin={handleOpenLogin}
              onOpenSignup={handleOpenSignup}
            />
          </>
        ) : (
          // Authenticated User View: Full Task Management System
          <>
            <div className="workspace-welcome-banner">
              <div>
                <h2 className="welcome-heading">Hello, {user.name} 👋</h2>
                <p className="welcome-subtext">Here is your personal to-do list for today.</p>
              </div>
            </div>

            {/* Dashboard Summary Statistics */}
            <DashboardSummary tasks={tasks} />

            {/* Task Creation / Edit Form Panel */}
            <TaskForm
              onSubmit={handleSubmitTask}
              editingTask={editingTask}
              onCancelEdit={handleCancelEdit}
              isSubmitting={isSubmitting}
            />

            {/* Task Filtering Tabs (Status + Priority) */}
            <TaskFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              counts={counts}
            />

            {/* Task Cards List */}
            <TaskList
              tasks={filteredTasks}
              loading={loading}
              error={error}
              onRetry={fetchAllTasks}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              activeFilter={activeFilter}
              priorityFilter={priorityFilter}
            />
          </>
        )}
      </main>

      <Footer />

      {/* Authentication Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskFlowApp />
    </AuthProvider>
  );
}
