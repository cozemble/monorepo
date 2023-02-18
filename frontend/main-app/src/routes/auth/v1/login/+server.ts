import type { RequestEvent } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { githubAuth, signInState, toUrlFriendly } from '../../github/githubAuth'

export function GET(event: RequestEvent) {
  const provider = event.url.searchParams.get('provider')
  const userPool = event.url.searchParams.get('userPool')
  if (!provider || !userPool) {
    return new Response('Missing provider or userPool', { status: 400 })
  }
  if (provider !== 'github') {
    return new Response(`Unsupported provider: ${provider}`, { status: 400 })
  }
  throw redirect(
    302,
    githubAuth.code.getUri({ state: toUrlFriendly(signInState('root', 'github')) }),
  )
}
