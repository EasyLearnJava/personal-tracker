const express = require('express');
const router = express.Router();
const ActivityLogService = require('../services/activityLogService');

// Get all activity logs
router.get('/', (req, res) => {
  try {
    const logs = ActivityLogService.getAllActivityLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity log by ID
router.get('/:id', (req, res) => {
  try {
    const log = ActivityLogService.getActivityLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Activity log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs by type
router.get('/type/:type', (req, res) => {
  try {
    const logs = ActivityLogService.getActivityLogsByType(req.params.type);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs by date range
router.get('/filter/daterange', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const logs = ActivityLogService.getActivityLogsByDateRange(startDate, endDate);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs by entity
router.get('/entity/:entityId/:entityType', (req, res) => {
  try {
    const logs = ActivityLogService.getActivityLogsByEntity(req.params.entityId, req.params.entityType);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs by category
router.get('/category/:category', (req, res) => {
  try {
    const logs = ActivityLogService.getActivityLogsByCategory(req.params.category);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity logs
router.get('/recent/:limit', (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 20;
    const logs = ActivityLogService.getRecentActivityLogs(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity statistics
router.get('/stats/all', (req, res) => {
  try {
    const stats = ActivityLogService.getActivityStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity summary by date
router.get('/summary/bydate', (req, res) => {
  try {
    const days = req.query.days || 30;
    const summary = ActivityLogService.getActivitySummaryByDate(days);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity by type and date range
router.get('/filter/typeanddate', (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: 'type, startDate, and endDate are required' });
    }
    const logs = ActivityLogService.getActivityByTypeAndDateRange(type, startDate, endDate);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new activity log
router.post('/', (req, res) => {
  try {
    const log = ActivityLogService.createActivityLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update activity log
router.put('/:id', (req, res) => {
  try {
    const log = ActivityLogService.updateActivityLog(req.params.id, req.body);
    if (!log) {
      return res.status(404).json({ error: 'Activity log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete activity log
router.delete('/:id', (req, res) => {
  try {
    const success = ActivityLogService.deleteActivityLog(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Activity log not found' });
    }
    res.json({ message: 'Activity log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

