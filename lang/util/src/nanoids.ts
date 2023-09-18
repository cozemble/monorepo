import { customAlphabet } from 'nanoid/non-secure'
const alphaNumeric = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 20)
export const nanoids = {
  alpha: () => alphaNumeric(),
}
