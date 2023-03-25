import type { RequestEvent } from '@sveltejs/kit'

export async function load(event: RequestEvent) {
  const authorizationCode = event.url.searchParams.get('token')

  return { authorizationCode }
}
