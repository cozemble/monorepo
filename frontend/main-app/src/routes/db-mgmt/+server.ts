import { random } from '@cozemble/lang-util'

export function GET() {
  const guess = random.intBetween(0, 1000)
  return new Response(`The random number is ${guess}`, { status: 200 })
}
