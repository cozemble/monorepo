import { random } from '@cozemble/lang-util'
import type { RequestEvent } from '@sveltejs/kit'

export function GET(event: RequestEvent) {
  console.log('GET', event)
  const guess = random.intBetween(0, 1000)
  return new Response(`The random number is ${guess}`, { status: 200 })
}

export function POST(event: RequestEvent) {
  return new Response('POST', { status: 200 })
}
