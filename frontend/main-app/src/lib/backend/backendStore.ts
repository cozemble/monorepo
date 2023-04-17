import { type Backend, notImplementedBackend } from './Backend'

export let backend = notImplementedBackend

export function setBackend(newBackend: Backend) {
  backend = newBackend
}
