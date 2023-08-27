import { z } from 'zod'
import TextInput from '$lib/inputs/TextInput.svelte'
import ErrorAlert from '$lib/inputs/ErrorAlert.svelte'
import ArrayContainer from '$lib/containers/ArrayContainer.svelte'
import FomArrayContainer from '$lib/fom/components/ArrayContainer.svelte'
import type { Path } from './helper'
import SelectInput from '$lib/inputs/SelectInput.svelte'
import type { FomSchema } from '$lib/fom/Fom'

export type ComponentAndProps = { component: any; props: any }

function componentAndProps(component: any, props: any = {}): ComponentAndProps {
  return { component, props }
}

export type ComponentFinder = (type: z.ZodType | FomSchema, path: Path) => ComponentAndProps
export type ErrorComponentFinder = (path: Path) => ComponentAndProps

export const defaultComponentFinder: ComponentFinder = (type, path) => {
  if (type instanceof z.ZodString || (type as FomSchema).type === 'text') {
    return componentAndProps(TextInput)
  }
  if (type instanceof z.ZodEnum || (type as FomSchema).type === 'enum') {
    return componentAndProps(SelectInput)
  }
  if (type instanceof z.ZodArray) {
    return componentAndProps(ArrayContainer)
  }
  if ((type as FomSchema).type === 'array') {
    return componentAndProps(FomArrayContainer)
  }
  throw new Error(`No component found for type ${type.constructor.name} at path ${path.join('.')}`)
}

export const defaultErrorComponentFinder: ErrorComponentFinder = (path) => {
  return componentAndProps(ErrorAlert)
}
