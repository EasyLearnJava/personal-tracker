/**
 * Task Manager Module
 * Handles all task-related operations
 */

class TaskManager {
  constructor(app) {
    this.app = app;
    this.tasks = [];
    this.filteredTasks = [];
    this.currentFilter = {
      status: '',
      priority: '',
      search: ''
    };
  }

  /**
   * Initialize task manager
   */
  async init() {
    this.setupEventListeners();
    await this.loadTasks();
  }

  /**
   * Setup event listeners for task UI
   */
  setupEventListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.openAddTaskModal());
    }

    // Task filters
    const statusFilter = document.getElementById('task-status-filter');
    const priorityFilter = document.getElementById('task-priority-filter');
    const searchInput = document.getElementById('task-search');

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentFilter.status = e.target.value;
        this.applyFilters();
      });
    }

    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.currentFilter.priority = e.target.value;
        this.applyFilters();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Task form
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTask();
      });
    }
  }

  /**
   * Load all tasks
   */
  async loadTasks() {
    try {
      this.tasks = await ExpenseAPI.getTasks();
      this.applyFilters();
      this.updateTaskStatistics();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  /**
   * Apply filters to tasks
   */
  applyFilters() {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = !this.currentFilter.status || task.status === this.currentFilter.status;
      const priorityMatch = !this.currentFilter.priority || task.priority === this.currentFilter.priority;
      const searchMatch = !this.currentFilter.search || 
        task.title.toLowerCase().includes(this.currentFilter.search) ||
        (task.description && task.description.toLowerCase().includes(this.currentFilter.search));

      return statusMatch && priorityMatch && searchMatch;
    });

    this.renderTasks();
  }

  /**
   * Render tasks to UI
   */
  renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;

    if (this.filteredTasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">No tasks found</div>
          <div class="empty-state-message">Create a new task to get started</div>
        </div>
      `;
      return;
    }

    tasksList.innerHTML = this.filteredTasks.map(task => this.createTaskElement(task)).join('');

    // Add event listeners to task items
    this.filteredTasks.forEach(task => {
      const checkbox = document.querySelector(`[data-task-id="${task.id}"] .task-checkbox`);
      const editBtn = document.querySelector(`[data-task-id="${task.id}"] .edit-btn`);
      const deleteBtn = document.querySelector(`[data-task-id="${task.id}"] .delete-btn`);

      if (checkbox) {
        checkbox.addEventListener('change', () => this.toggleTaskStatus(task.id));
      }
      if (editBtn) {
        editBtn.addEventListener('click', () => this.openEditTaskModal(task.id));
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
      }
    });
  }

  /**
   * Calculate days until due date
   */
  calculateDaysUntilDue(dueDate) {
    if (!dueDate) return null;

    // Parse the date string (YYYY-MM-DD format from database)
    const [year, month, day] = dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Get days display text
   */
  getDaysDisplayText(daysUntilDue) {
    if (daysUntilDue === null) return '';

    if (daysUntilDue === 0) return 'Due Today';
    if (daysUntilDue === 1) return 'Due Tomorrow';
    if (daysUntilDue === -1) return '1 day overdue';
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue <= 7) return `${daysUntilDue} days left`;

    return `${daysUntilDue} days left`;
  }

  /**
   * Create task element HTML
   */
  createTaskElement(task) {
    const isCompleted = task.status === 'completed';
    const daysUntilDue = this.calculateDaysUntilDue(task.due_date);
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && !isCompleted;
    const dueDate = task.due_date ? new Date(task.due_date + 'T00:00:00').toLocaleDateString() : '';
    const daysText = this.getDaysDisplayText(daysUntilDue);

    return `
      <div class="task-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue-task' : ''}" data-task-id="${task.id}">
        <div style="display: flex; gap: 10px; width: 100%;">
          <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''}>
          <div class="task-content" style="width: 100%;">
            <div class="task-header">
              <div class="task-title">${this.escapeHtml(task.title)}</div>
              <div class="task-priority-badge task-priority-${task.priority}">
                ${this.getPriorityIcon(task.priority)} ${task.priority.toUpperCase()}
              </div>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
              <span class="task-badge task-status-${task.status}">📌 ${task.status.replace('_', ' ')}</span>
              ${task.category ? `<span class="task-badge">📂 ${this.escapeHtml(task.category)}</span>` : ''}
              ${task.assigned_to ? `<span class="task-badge">👤 Assigned</span>` : ''}
            </div>
            ${dueDate ? `
              <div class="task-due-info ${isOverdue ? 'overdue' : ''}">
                <span class="due-date">📅 ${dueDate}</span>
                <span class="days-left ${isOverdue ? 'overdue-text' : ''}">${daysText}</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn edit-btn" title="Edit task">✏️ Edit</button>
          <button class="task-action-btn delete delete-btn" title="Delete task">🗑️ Delete</button>
        </div>
      </div>
    `;
  }

  /**
   * Get priority icon
   */
  getPriorityIcon(priority) {
    const icons = {
      'urgent': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };
    return icons[priority] || '🎯';
  }

  /**
   * Open add task modal
   */
  async openAddTaskModal() {
    document.getElementById('task-id').value = '';
    document.getElementById('task-modal-title').textContent = 'Add Task';
    document.getElementById('task-form').reset();
    await this.loadUsersForAssignment();
    UI.showModal('task-modal');
  }

  /**
   * Open edit task modal
   */
  async openEditTaskModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    await this.loadUsersForAssignment();

    document.getElementById('task-id').value = task.id;
    document.getElementById('task-modal-title').textContent = 'Edit Task';
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-category').value = task.category || '';
    document.getElementById('task-due-date').value = task.due_date || '';
    document.getElementById('task-assigned-to').value = task.assigned_to || '';
    document.getElementById('task-tags').value = (task.tags || []).join(', ');

    UI.showModal('task-modal');
  }

  /**
   * Save task
   */
  async saveTask() {
    try {
      const taskId = document.getElementById('task-id').value;
      const dueDateInput = document.getElementById('task-due-date').value;

      // Handle date properly - the input gives us YYYY-MM-DD
      // We need to send it as-is to avoid timezone issues
      let dueDate = null;
      if (dueDateInput) {
        dueDate = dueDateInput; // Keep as YYYY-MM-DD string
      }

      const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        category: document.getElementById('task-category').value,
        dueDate: dueDate,
        assignedTo: document.getElementById('task-assigned-to').value || null,
        tags: document.getElementById('task-tags').value.split(',').map(t => t.trim()).filter(t => t)
      };

      console.log('Saving task with data:', taskData);

      let result;
      if (taskId) {
        result = await ExpenseAPI.updateTask(taskId, taskData);
      } else {
        result = await ExpenseAPI.createTask(taskData);
      }

      if (result.error) {
        console.error('Task save error:', result.error);
        alert('Failed to save task: ' + result.error);
        return;
      }

      UI.hideModal('task-modal');
      await this.loadTasks();
      UI.showNotification('Task saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task: ' + error.message);
    }
  }

  /**
   * Toggle task status
   */
  async toggleTaskStatus(taskId) {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'not_started' : 'completed';
      await ExpenseAPI.updateTaskStatus(taskId, newStatus);
      await this.loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await ExpenseAPI.deleteTask(taskId);
      await this.loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  }

  /**
   * Update task statistics
   */
  updateTaskStatistics() {
    const stats = {
      total: this.tasks.length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      inProgress: this.tasks.filter(t => t.status === 'in_progress').length,
      overdue: this.tasks.filter(t => {
        if (t.status === 'completed' || !t.due_date) return false;
        const daysUntilDue = this.calculateDaysUntilDue(t.due_date);
        return daysUntilDue < 0;
      }).length
    };

    document.getElementById('task-total').textContent = stats.total;
    document.getElementById('task-completed').textContent = stats.completed;
    document.getElementById('task-in-progress').textContent = stats.inProgress;
    document.getElementById('task-overdue').textContent = stats.overdue;
  }

  /**
   * Load users for task assignment dropdown
   */
  async loadUsersForAssignment() {
    try {
      const users = await ExpenseAPI.getAllUsers();
      const select = document.getElementById('task-assigned-to');

      if (!select) return;

      // Keep the default option
      const defaultOption = select.querySelector('option[value=""]');
      select.innerHTML = '';
      if (defaultOption) {
        select.appendChild(defaultOption);
      }

      // Add users to dropdown
      if (users && users.length > 0) {
        users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          // Display full_name first, fallback to email
          option.textContent = user.full_name || user.email || 'Unknown User';
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading users for assignment:', error);
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

