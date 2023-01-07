export function promiseOf<T>(v: T): Promise<T> {
  return new Promise((resolve, _reject) => {
    resolve(v)
  })
}

export function truthPoller(predicate: () => boolean, intervalMs = 50): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    function poller() {
      if (predicate()) {
        return resolve(true)
      }
      setTimeout(poller, intervalMs)
    }
    poller()
  })
}
