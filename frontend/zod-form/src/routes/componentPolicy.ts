import { z } from 'zod'
import TextInput from '$lib/inputs/TextInput.svelte'
import ErrorAlert from '$lib/inputs/ErrorAlert.svelte'

export type ComponentAndProps = { component: any; props: any }

function componentAndProps(component: any, props: any = {}): ComponentAndProps {
  return { component, props }
}

export type ComponentFinder = (type: z.ZodType, path: string[]) => ComponentAndProps
export type ErrorComponentFinder = (path: string[]) => ComponentAndProps

export const defaultComponentFinder: ComponentFinder = (type, path) => {
  if (type instanceof z.ZodString) {
    return componentAndProps(TextInput)
  }
  throw new Error(`No component found for type ${type.constructor.name} at path ${path.join('.')}`)
}

export const defaultErrorComponentFinder: ErrorComponentFinder = (path) => {
  return componentAndProps(ErrorAlert)
}
