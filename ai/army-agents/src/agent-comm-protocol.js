/**
 * Agent Communication Protocol
 * RPC protocol for inter-agent communication
 */

class AgentCommProtocol {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      backoffMs: config.backoffMs || 1000,
      ...config
    };

    this.handlers = new Map(); // messageType -> handler
    this.pendingRequests = new Map(); // requestId -> { resolve, reject, timer }
    this.requestCounter = 0;
  }

  /**
   * Create an RPC message
   */
  createMessage(type, payload, options = {}) {
    return {
      id: this._generateRequestId(),
      type,
      payload,
      from: options.from || 'unknown',
      to: options.to,
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...options
    };
  }

  /**
   * Send RPC call and wait for response
   */
  async sendRPC(message, transport) {
    if (!transport) {
      throw new Error('Transport required for RPC');
    }

    const requestId = message.id;
    let retries = 0;

    while (retries < this.config.retries) {
      try {
        return await this._sendWithTimeout(message, transport, requestId);
      } catch (error) {
        retries++;

        if (retries >= this.config.retries) {
          throw error;
        }

        // Exponential backoff
        const delay = this.config.backoffMs * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Send async message (no response expected)
   */
  async sendMessage(message, transport) {
    if (!transport) {
      throw new Error('Transport required for message');
    }

    return transport.send(message);
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message) {
    try {
      // Check if it's a response to a pending request
      if (message.isResponse && this.pendingRequests.has(message.requestId)) {
        this._handleResponse(message);
        return;
      }

      // Check if it's a request
      if (message.type) {
        const handler = this.handlers.get(message.type);

        if (!handler) {
          return this._createErrorResponse(message, 'Unknown message type');
        }

        try {
          const result = await handler(message);
          return this._createResponse(message, result);
        } catch (error) {
          return this._createErrorResponse(message, error.message);
        }
      }
    } catch (error) {
      console.error('[CommProtocol] Error handling message:', error);
      throw error;
    }
  }

  /**
   * Register message handler
   */
  registerHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * Unregister message handler
   */
  unregisterHandler(type) {
    this.handlers.delete(type);
  }

  /**
   * Create response message
   */
  _createResponse(requestMessage, result) {
    return {
      id: this._generateRequestId(),
      requestId: requestMessage.id,
      type: `${requestMessage.type}:response`,
      payload: result,
      isResponse: true,
      timestamp: new Date().toISOString(),
      from: requestMessage.to,
      to: requestMessage.from
    };
  }

  /**
   * Create error response
   */
  _createErrorResponse(requestMessage, errorMessage) {
    return this._createResponse(requestMessage, {
      success: false,
      error: errorMessage
    });
  }

  /**
   * Send with timeout
   */
  async _sendWithTimeout(message, transport, requestId) {
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${message.type}`));
      }, this.config.timeout);

      // Store pending request
      this.pendingRequests.set(requestId, { resolve, reject, timer });

      // Send message
      transport.send(message)
        .catch(error => {
          clearTimeout(timer);
          this.pendingRequests.delete(requestId);
          reject(error);
        });
    });
  }

  /**
   * Handle response to pending request
   */
  _handleResponse(message) {
    const pending = this.pendingRequests.get(message.requestId);

    if (pending) {
      clearTimeout(pending.timer);
      this.pendingRequests.delete(message.requestId);

      if (message.payload.success === false) {
        pending.reject(new Error(message.payload.error));
      } else {
        pending.resolve(message.payload);
      }
    }
  }

  /**
   * Generate unique request ID
   */
  _generateRequestId() {
    return `req-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Validate message
   */
  validateMessage(message) {
    const required = ['id', 'type', 'timestamp'];
    const missing = required.filter(field => !message[field]);

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`]
      };
    }

    if (typeof message.id !== 'string') {
      return { valid: false, errors: ['id must be a string'] };
    }

    if (typeof message.type !== 'string') {
      return { valid: false, errors: ['type must be a string'] };
    }

    return { valid: true };
  }

  /**
   * Get protocol statistics
   */
  getStatistics() {
    return {
      registeredHandlers: this.handlers.size,
      pendingRequests: this.pendingRequests.size,
      handlers: Array.from(this.handlers.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AgentCommProtocol;
