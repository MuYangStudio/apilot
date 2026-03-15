import { InterceptorHandler } from './types';

export class InterceptorManager<T> {
  private handlers: Array<InterceptorHandler<T>> = [];

  use(onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: any) => any): number {
    this.handlers.push({ onFulfilled, onRejected });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = {}; // 清空，不改变数组长度，避免影响后续索引
    }
  }

  forEach(fn: (handler: InterceptorHandler<T>) => void): void {
    this.handlers.forEach(handler => {
      if (handler.onFulfilled || handler.onRejected) {
        fn(handler);
      }
    });
  }
}