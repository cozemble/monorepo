export const createUID = (length = 8) =>
  (Math.random() * Date.now()).toString(36).substring(2, 2 + length)
