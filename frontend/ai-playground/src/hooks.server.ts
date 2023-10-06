import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(10, '60 s'),
  analytics: true,
})

const rateLimitUrl: string[] = ['/guessTableType']

const handleRateLimit: Handle = async ({ event, resolve }) => {
  const existURL = rateLimitUrl.filter((url) => event.url.pathname.endsWith(url))
  const ip = event.request.headers.get('X-Forwarded-For') ?? event.request.headers.get('x-real-ip')

  const res = await resolve(event)

  if (existURL.length) {
    const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_middleware_${ip}`)

    console.log(success)

    res.headers.set('X-RateLimit-Limit', limit.toString())
    res.headers.set('X-RateLimit-Remaining', remaining.toString())
    res.headers.set('X-RateLimit-Reset', reset.toString())
  }

  return res
}

export const handle = sequence(handleRateLimit)
