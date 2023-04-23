import { type Backend, ErrorListenerBackend, notImplementedBackend } from '@cozemble/frontend-bff'

export let backend = notImplementedBackend
export type ErrorListener = (e: any) => void
export const errorListener: ErrorListener[] = []

export function addErrorListener(listener: ErrorListener) {
  errorListener.push(listener)
}

export function setBackend(newBackend: Backend) {
  backend = new ErrorListenerBackend(newBackend, errorListener)
}
