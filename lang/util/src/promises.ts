export function promiseOf<T>(v: T): Promise<T> {
  return new Promise((resolve, _reject) => {
    resolve(v)
  })
}

export function truthPoller(predicate: () => Boolean, intervalMs = 50): Promise<Boolean> {
  return new Promise<Boolean>((resolve) => {
    function poller() {
      if (predicate()) {
        return resolve(true)
      }
      setTimeout(poller, intervalMs)
    }
    poller()
  })
}
