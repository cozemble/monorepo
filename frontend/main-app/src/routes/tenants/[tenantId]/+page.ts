import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { useLocal } from '../../../lib/config'

export const load: PageLoad = async () => {
  if (browser) {
    if (window.location.href.startsWith('http://localhost')) {
      useLocal()
    }
  }
}
