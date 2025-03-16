// src/core/events/EventBus.ts
export type EventCallback<T = any> = (data: T) => void;

export class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  /**
   * Subscribe to an event
   * @param eventName The name of the event to subscribe to
   * @param callback The function to call when the event is emitted
   * @returns A function to unsubscribe from the event
   */
  on<T = any>(eventName: string, callback: EventCallback<T>): () => void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback as EventCallback);

    // Return an unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param eventName The name of the event to unsubscribe from
   * @param callback The callback to remove
   */
  off<T = any>(eventName: string, callback: EventCallback<T>): void {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Emit an event with data
   * @param eventName The name of the event to emit
   * @param data The data to pass to the event callbacks
   */
  emit<T = any>(eventName: string, data?: T): void {
    console.log(`[Event] ${eventName}`, data);
    if (!this.listeners[eventName]) return;
    this.listeners[eventName].forEach((callback) => callback(data));
  }
}

// Create a singleton instance for global use
export const eventBus = new EventBus();
