import { customAlphabet } from 'nanoid'
const alphaNumeric = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 20)
export const nanoids = {
  alpha: () => alphaNumeric(),
}
