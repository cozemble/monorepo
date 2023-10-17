import { get, writable } from 'svelte/store'
import { createUID } from '$lib/utils'

export interface Notification {
  _id: string
  _createdAt: number
  text: string
  description?: string
  icon?: string

  /** default: neutral */
  type: 'neutral' | 'info' | 'success' | 'error' | 'warning' | 'loading'

  show: boolean // TODO remove this when the close function is refactored
  isClosable?: boolean
  handleClose: () => void
  duration?: number
}

interface NotificationCreateOptions {
  text: string
  description?: string

  /** default: neutral */
  type?: Notification['type']
  /** custom icon option */
  icon?: string

  isClosable?: boolean
  /** Callback when notification is closed */
  onClose?: () => void // TODO rename this to onCloseCallback
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
    // TODO rename this to close
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

// TODO remove the notification from the store when it is closed
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

// TODO remove this when the app is ready
// A notification to show when the app is in early prototype
create({
  text: 'This is an early prototype',
  description: 'No functionality is implemented yet',
  type: 'neutral',
  isClosable: true,
  // duration: 2000,
  icon: 'wpf:maintenance',
})

export default {
  ...notificationStore,
  get,
  create,
  remove,
  close,
}
