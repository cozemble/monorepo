export interface Clock {
  now(): Date
}

export class SystemClock implements Clock {
  now() {
    return new Date()
  }
}

export class FixedClock implements Clock {
  constructor(private readonly when: Date = new Date()) {}

  now() {
    return this.when
  }
}

export const clock = new SystemClock()
