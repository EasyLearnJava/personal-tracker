const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

class TaskService {
  /**
   * Get all tasks for a user
   */
  static async getAllTasks(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching all tasks', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(taskId, userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching task', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Create a new task
   */
  static async createTask(userId, taskData) {
    try {
      // Ensure due_date is in YYYY-MM-DD format (no timezone conversion)
      let dueDate = null;
      if (taskData.dueDate) {
        // If it's already in YYYY-MM-DD format, keep it as-is
        dueDate = taskData.dueDate;
      }

      const { data, error } = await supabaseAdmin
        .from('tasks')
        .insert([{
          user_id: userId,
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status || 'not_started',
          priority: taskData.priority || 'medium',
          category: taskData.category || null,
          due_date: dueDate,
          assigned_to: taskData.assignedTo || null,
          tags: taskData.tags || []
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Task created', { taskId: data.id, userId, dueDate });
      return data;
    } catch (error) {
      logger.error('Error creating task', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Update a task
   */
  static async updateTask(taskId, userId, updates) {
    try {
      // Ensure due_date is in YYYY-MM-DD format (no timezone conversion)
      let dueDate = updates.dueDate;
      if (dueDate === '') {
        dueDate = null;
      }

      const { data, error } = await supabaseAdmin
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          category: updates.category,
          due_date: dueDate,
          assigned_to: updates.assignedTo,
          tags: updates.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Task updated', { taskId, userId, dueDate });
      return data;
    } catch (error) {
      logger.error('Error updating task', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId, userId) {
    try {
      const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Task deleted', { taskId, userId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting task', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(userId, status) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching tasks by status', { userId, status, error: error.message });
      throw error;
    }
  }

  /**
   * Get tasks by priority
   */
  static async getTasksByPriority(userId, priority) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('priority', priority)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching tasks by priority', { userId, priority, error: error.message });
      throw error;
    }
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'completed')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching overdue tasks', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  static async getTaskStatistics(userId) {
    try {
      const tasks = await this.getAllTasks(userId);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        notStarted: tasks.filter(t => t.status === 'not_started').length,
        overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.due_date) < new Date()).length,
        byPriority: {
          urgent: tasks.filter(t => t.priority === 'urgent').length,
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        }
      };

      return stats;
    } catch (error) {
      logger.error('Error fetching task statistics', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(taskId, userId, status) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Task status updated', { taskId, userId, status });
      return data;
    } catch (error) {
      logger.error('Error updating task status', { taskId, userId, error: error.message });
      throw error;
    }
  }
}

module.exports = TaskService;

