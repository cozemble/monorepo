export class Stack<T> {
  private readonly storage: T[] = [];

  constructor(initial: T[] = []) {
    this.storage = initial
  }

  push(item: T): void {
    this.storage.push(item);
  }

  pop(): T | undefined {
    return this.storage.pop();
  }

  peek(): T | undefined {
    return this.storage[this.size() - 1];
  }

  size(): number {
    return this.storage.length;
  }
}
