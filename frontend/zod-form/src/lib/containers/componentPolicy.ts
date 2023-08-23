import { z } from 'zod'
import TextInput from '$lib/inputs/TextInput.svelte'
import ErrorAlert from '$lib/inputs/ErrorAlert.svelte'
import ArrayContainer from '$lib/containers/ArrayContainer.svelte'
import type { Path } from './helper'
import SelectInput from '$lib/inputs/SelectInput.svelte'

export type ComponentAndProps = { component: any; props: any }

function componentAndProps(component: any, props: any = {}): ComponentAndProps {
  return { component, props }
}

export type ComponentFinder = (type: z.ZodType, path: Path) => ComponentAndProps
export type ErrorComponentFinder = (path: Path) => ComponentAndProps

export const defaultComponentFinder: ComponentFinder = (type, path) => {
  if (type instanceof z.ZodString) {
    return componentAndProps(TextInput)
  }
  if (type instanceof z.ZodEnum) {
    return componentAndProps(SelectInput)
  }
  if (type instanceof z.ZodArray) {
    return componentAndProps(ArrayContainer)
  }
  throw new Error(`No component found for type ${type.constructor.name} at path ${path.join('.')}`)
}

export const defaultErrorComponentFinder: ErrorComponentFinder = (path) => {
  return componentAndProps(ErrorAlert)
}
