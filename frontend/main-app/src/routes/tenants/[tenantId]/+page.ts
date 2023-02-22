import type { PageLoad } from './$types'
import { browser } from '$app/environment'

export const load: PageLoad = async (event) => {
  if (browser) {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            post: {
              title: `Title for ${event.params.tenantId} goes here`,
              content: `Content for ${event.params.tenantId} goes here`,
            },
          }),
        3000,
      )
    })
  }
}
