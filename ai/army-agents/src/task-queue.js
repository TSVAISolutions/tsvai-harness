/**
 * Task Queue
 * Central queue for distributing work to agents
 * Pattern inspired by vega/army task distribution
 */

class TaskQueue {
  constructor(config = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      taskTimeout: config.taskTimeout || 300000, // 5 minutes
      ...config
    };

    this.tasks = new Map(); // taskId -> task
    this.queue = []; // pending task IDs in order
    this.taskCounter = 0;
    this.eventLog = [];
  }

  /**
   * Enqueue a task
   */
  enqueueTask(taskDef) {
    const taskId = this._generateTaskId();

    const task = {
      id: taskId,
      ...taskDef,
      status: 'pending',
      priority: taskDef.priority || 0,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      attempts: 0,
      result: null,
      error: null
    };

    this.tasks.set(taskId, task);
    this.queue.push(taskId);

    // Sort by priority (higher first)
    this.queue.sort((a, b) => {
      const taskA = this.tasks.get(a);
      const taskB = this.tasks.get(b);
      return (taskB.priority || 0) - (taskA.priority || 0);
    });

    this._logEvent('task_enqueued', { taskId, priority: task.priority });

    return {
      success: true,
      taskId,
      status: 'queued'
    };
  }

  /**
   * Get next pending task
   */
  getNextTask() {
    while (this.queue.length > 0) {
      const taskId = this.queue[0];
      const task = this.tasks.get(taskId);

      if (!task) {
        this.queue.shift();
        continue;
      }

      if (task.status === 'pending') {
        return { taskId, ...task };
      }

      this.queue.shift();
    }

    return null;
  }

  /**
   * Mark task as started
   */
  startTask(taskId, agentId) {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.status = 'running';
    task.agentId = agentId;
    task.startedAt = new Date().toISOString();
    task.attempts++;

    this._logEvent('task_started', { taskId, agentId, attempt: task.attempts });

    return { success: true, taskId, agentId };
  }

  /**
   * Mark task as completed
   */
  completeTask(taskId, result) {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.status = 'completed';
    task.result = result;
    task.completedAt = new Date().toISOString();

    // Remove from queue
    const idx = this.queue.indexOf(taskId);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
    }

    this._logEvent('task_completed', { taskId, duration: this._getDuration(task) });

    return { success: true, taskId };
  }

  /**
   * Mark task as failed
   */
  failTask(taskId, error) {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.error = error;

    // Check if we should retry
    if (task.attempts < this.config.maxRetries) {
      task.status = 'pending';
      task.agentId = null;
      this.queue.push(taskId);

      this._logEvent('task_retrying', {
        taskId,
        error,
        attempt: task.attempts,
        maxRetries: this.config.maxRetries
      });
    } else {
      task.status = 'failed';

      // Remove from queue
      const idx = this.queue.indexOf(taskId);
      if (idx !== -1) {
        this.queue.splice(idx, 1);
      }

      this._logEvent('task_failed', {
        taskId,
        error,
        attempts: task.attempts
      });
    }

    return { success: true, taskId, retrying: task.status === 'pending' };
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * List tasks by status
   */
  listTasks(status = null, limit = 100) {
    let tasks = Array.from(this.tasks.values());

    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    return tasks.slice(0, limit);
  }

  /**
   * Get queue statistics
   */
  getStatistics() {
    const tasks = Array.from(this.tasks.values());

    const byStatus = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0
    };

    const byCapability = {};

    tasks.forEach(task => {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;

      if (task.capability) {
        byCapability[task.capability] = (byCapability[task.capability] || 0) + 1;
      }
    });

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const avgDuration = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + this._getDuration(t), 0) / completedTasks.length
      : 0;

    return {
      totalTasks: tasks.length,
      queueLength: this.queue.length,
      byStatus,
      byCapability,
      averageDuration: Math.round(avgDuration),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get event log
   */
  getEventLog(limit = 100) {
    return this.eventLog.slice(-limit);
  }

  /**
   * Clear completed tasks
   */
  clearCompleted(olderThan = 3600000) {
    const now = Date.now();
    const toDelete = [];

    this.tasks.forEach((task, taskId) => {
      if (task.status === 'completed' && task.completedAt) {
        const age = now - new Date(task.completedAt).getTime();
        if (age > olderThan) {
          toDelete.push(taskId);
        }
      }
    });

    toDelete.forEach(taskId => {
      this.tasks.delete(taskId);
      const idx = this.queue.indexOf(taskId);
      if (idx !== -1) {
        this.queue.splice(idx, 1);
      }
    });

    return { cleaned: toDelete.length };
  }

  // ============ Private Methods ============

  _generateTaskId() {
    return `task-${Date.now()}-${++this.taskCounter}`;
  }

  _logEvent(type, data) {
    this.eventLog.push({
      timestamp: new Date().toISOString(),
      type,
      data
    });

    // Keep log bounded
    if (this.eventLog.length > 1000) {
      this.eventLog.shift();
    }
  }

  _getDuration(task) {
    if (!task.startedAt || !task.completedAt) return 0;
    return new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime();
  }
}

module.exports = TaskQueue;
