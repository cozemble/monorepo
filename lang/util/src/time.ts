export const time = {
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
}
