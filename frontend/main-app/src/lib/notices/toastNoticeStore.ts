import { writable } from 'svelte/store'
import { uuids } from '@cozemble/lang-util'

export interface ToastNotice {
  _type: 'toast.notice'
  id: string
  message: string
  level: 'info' | 'warning' | 'error' | 'success'
}

export const toastNoticeStore = writable([] as ToastNotice[])

export const toastNoticeStoreFns = {
  add(
    message: string,
    level: 'info' | 'warning' | 'error' | 'success',
    displayTimeMillis = 0,
  ): void {
    const id = uuids.v4()
    toastNoticeStore.update((notices) => [
      ...notices,
      { _type: 'toast.notice', id, message, level },
    ])
    if (displayTimeMillis > 0) {
      setTimeout(() => toastNoticeStoreFns.dismiss(id), displayTimeMillis)
    }
  },
  dismiss(toastId: string) {
    toastNoticeStore.update((notices) => notices.filter((n) => n.id !== toastId))
  },
}
