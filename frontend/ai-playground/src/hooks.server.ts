import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(10, '60 s'),
  analytics: true,
})

// url stacks
const rateLimitUrl: string[] = ['/guessTableType']

const handleRateLimit: Handle = async ({ event, resolve }) => {
  const existURL = rateLimitUrl.filter((url) => event.url.pathname.endsWith(url))

  const ip = event.request.headers.get('X-Forwarded-For') ?? event.request.headers.get('x-real-ip')
  const identifier = ip ?? event.getClientAddress()

  if (existURL.length) {
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_middleware_${identifier}`,
    )

    console.log(success)

    event.setHeaders({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    })
  }

  const response = await resolve(event)
  return response
}

export const handle: Handle = sequence(handleRateLimit)
