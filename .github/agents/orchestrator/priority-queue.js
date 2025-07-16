/**
 * Priority Queue implementation for task management
 * Higher priority values are processed first
 */
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  /**
   * Add an item with priority
   * @param {*} item - The item to add
   * @param {number} priority - Priority level (higher = more urgent)
   */
  enqueue(item, priority = 0) {
    const queueItem = { item, priority, timestamp: Date.now() };
    
    // Find correct position based on priority
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueItem.priority > this.items[i].priority) {
        this.items.splice(i, 0, queueItem);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(queueItem);
    }
  }

  /**
   * Remove and return the highest priority item
   * @returns {*} The highest priority item
   */
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift().item;
  }

  /**
   * Get the highest priority item without removing it
   * @returns {*} The highest priority item
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0].item;
  }

  /**
   * Check if queue is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Get the size of the queue
   * @returns {number}
   */
  size() {
    return this.items.length;
  }

  /**
   * Get all items with a specific priority
   * @param {number} priority
   * @returns {Array}
   */
  getByPriority(priority) {
    return this.items
      .filter(item => item.priority === priority)
      .map(item => item.item);
  }

  /**
   * Clear the queue
   */
  clear() {
    this.items = [];
  }

  /**
   * Get queue statistics
   * @returns {Object}
   */
  getStats() {
    const priorities = {};
    this.items.forEach(item => {
      priorities[item.priority] = (priorities[item.priority] || 0) + 1;
    });
    
    return {
      total: this.items.length,
      priorities,
      oldest: this.items.length > 0 ? 
        new Date(Math.min(...this.items.map(i => i.timestamp))) : null
    };
  }
}

module.exports = { PriorityQueue };