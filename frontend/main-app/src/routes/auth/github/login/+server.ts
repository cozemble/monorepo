import type { RequestEvent } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { githubAuth } from '../githubAuth'

export function GET(_event: RequestEvent) {
  throw redirect(302, githubAuth.code.getUri())
}
