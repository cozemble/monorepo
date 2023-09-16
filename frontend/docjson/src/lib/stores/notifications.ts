import { get, writable } from 'svelte/store'
import { createUID } from '$lib/utils'

export interface Notification {
  _id: string
  _createdAt: number
  text: string
  description?: string
  icon?: string

  /**
   * @default 'neutral'
   * neutral, info, success, error, warning, loading
   */
  type: 'info' | 'neutral' | 'success' | 'error' | 'warning' | 'loading'

  show: boolean
  isClosable?: boolean
  handleClose: () => void
  duration?: number
}

interface NotificationCreateOptions {
  text: string
  description?: string

  /** @default 'neutral'
   * @see Notification['type']
   */
  type?: Notification['type']
  /** custom icon option */
  icon?: string

  isClosable?: boolean
  /** Callback when notification is closed */
  onClose?: () => void
  duration?: number
}

//

const notificationStore = writable<Notification[]>([])

/**
 * Create a notification and add it to the store
 * @param options Notification options
 * @returns notification
 */
const create = (options: NotificationCreateOptions): Notification => {
  const _id = createUID()
  const notification: Notification = {
    _id,
    _createdAt: Date.now(),
    type: options.type || 'neutral',

    show: true,
    isClosable: options.isClosable ?? true,
    handleClose: () => {
      close(_id)
      options.onClose?.()
    },
    ...options,
  }

  notificationStore.update((notifications) => [...notifications, notification])

  // Auto close notification
  if (options.duration) {
    setTimeout(() => {
      notification.handleClose()
    }, notification.duration)
  }

  return notification
}

const remove = (id: string) => {
  notificationStore.update((notifications) =>
    notifications.filter((notification) => notification._id !== id),
  )
}

/**
 * Turns show to false of a notification
 * @param id Notification ID
 */
const close = (id: string) => {
  notificationStore.update((notifications) =>
    notifications.map((notification) => {
      if (notification._id === id) {
        notification.show = false
        console.log('close', notification)
      }

      return notification
    }),
  )
}

export default {
  ...notificationStore,
  get,
  create,
  remove,
  close,
}
