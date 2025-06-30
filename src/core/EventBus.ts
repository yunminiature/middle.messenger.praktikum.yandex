type Callback = (...args: unknown[]) => void;

export class EventBus {
  private listeners: Record<string, Callback[]> = {};

  public on(event: string, callback: Callback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: Callback): void {
    const callbacks = this.listeners[event];
    if (!callbacks) return;
    this.listeners[event] = callbacks.filter(cb => cb !== callback);
  }

  public emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners[event];
    if (!callbacks) return;
    callbacks.forEach(cb => cb(...args));
  }
}
