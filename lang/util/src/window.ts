export class Windower<T> {
  constructor(private readonly size: number,
              private readonly array: T[],
              private offset = 0) {
  }

  current(): T[] | null {
    const endIndex = this.size + this.offset
    if (endIndex > this.array.length) {
      return null
    }
    return this.array.slice(this.offset, this.offset + this.size)
  }

  advance(amount = 1): Windower<T> {
    this.offset = this.offset + amount
    return this
  }
}
