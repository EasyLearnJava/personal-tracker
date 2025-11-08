const express = require('express');
const router = express.Router();
const TaskService = require('../services/taskService');
const logger = require('../utils/logger');

// Middleware to verify user is authenticated
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    logger.warn('Unauthorized task request - no user ID');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

router.use(requireAuth);

/**
 * GET /api/tasks
 * Get all tasks for the current user
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await TaskService.getAllTasks(req.userId);
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/:id
 * Get a specific task
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id, req.userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    logger.error('Error fetching task', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate, assignedTo, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await TaskService.createTask(req.userId, {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      assignedTo,
      tags
    });

    logger.info('Task created successfully', { taskId: task.id });
    res.status(201).json(task);
  } catch (error) {
    logger.error('Error creating task', { error: error.message });
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate, assignedTo, tags } = req.body;

    const task = await TaskService.updateTask(req.params.id, req.userId, {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      assignedTo,
      tags
    });

    logger.info('Task updated successfully', { taskId: task.id });
    res.json(task);
  } catch (error) {
    logger.error('Error updating task', { error: error.message });
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res) => {
  try {
    await TaskService.deleteTask(req.params.id, req.userId);
    logger.info('Task deleted successfully', { taskId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting task', { error: error.message });
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * GET /api/tasks/filter/status?status=completed
 * Get tasks by status
 */
router.get('/filter/status', async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const tasks = await TaskService.getTasksByStatus(req.userId, status);
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks by status', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/filter/priority?priority=high
 * Get tasks by priority
 */
router.get('/filter/priority', async (req, res) => {
  try {
    const { priority } = req.query;
    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }
    const tasks = await TaskService.getTasksByPriority(req.userId, priority);
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks by priority', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/filter/overdue
 * Get overdue tasks
 */
router.get('/filter/overdue', async (req, res) => {
  try {
    const tasks = await TaskService.getOverdueTasks(req.userId);
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching overdue tasks', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
});

/**
 * GET /api/tasks/stats/summary
 * Get task statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await TaskService.getTaskStatistics(req.userId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching task statistics', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * PUT /api/tasks/:id/status
 * Update task status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const task = await TaskService.updateTaskStatus(req.params.id, req.userId, status);
    logger.info('Task status updated', { taskId: task.id, status });
    res.json(task);
  } catch (error) {
    logger.error('Error updating task status', { error: error.message });
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

module.exports = router;

