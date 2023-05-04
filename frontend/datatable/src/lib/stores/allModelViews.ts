import type { ModelView } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export let allModelViews = writable<ModelView[]>([])

export function setAllModelViews(views: Writable<ModelView[]>): void {
  allModelViews = views
}

allModelViews.subscribe((views) => {
  console.log({ views })
})
