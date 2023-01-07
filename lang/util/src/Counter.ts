export class Counter {
  constructor(private count = 0) {}

  nextValue(): number {
    const result = this.count
    this.count++
    return result
  }
}
