import { browser } from '$app/environment'
import { useLocal } from '../lib/config'

export const load = async () => {
  if (browser) {
    if (window.location.href.includes('localhost')) {
      useLocal()
    }
  }
}
