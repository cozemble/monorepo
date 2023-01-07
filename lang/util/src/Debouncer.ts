// const theSetTimeoutFunction = (window && window.setTimeout) ? window.setTimeout : setTimeout
export class Debouncer {
  constructor(
    private readonly action: () => Promise<void>,
    private readonly timeout = 500,
    private timer?: ReturnType<typeof setTimeout>,
  ) {}

  close() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  debounce() {
    this.close()
    this.timer = setTimeout(async () => {
      await this.action()
    }, this.timeout)
  }
}
