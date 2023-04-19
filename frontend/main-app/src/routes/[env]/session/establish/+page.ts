import type { RequestEvent } from '@sveltejs/kit'

export async function load(event: RequestEvent) {
  const authorizationCode = event.url.searchParams.get('token')
  const env = event.params.env

  return { authorizationCode, env }
}
