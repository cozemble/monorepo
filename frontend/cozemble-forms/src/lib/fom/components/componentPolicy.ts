import TextInput from '../../inputs/TextInput.svelte'
import ErrorAlert from '../../inputs/ErrorAlert.svelte'
import FomArrayContainer from './ArrayContainer.svelte'
import type { Path } from './helper'
import SelectInput from '../../inputs/SelectInput.svelte'
import type { FomSchema } from '../Fom'
import CheckboxInput from '../../inputs/CheckboxInput.svelte'

export type ComponentAndProps = { component: any; props: any }

function componentAndProps(component: any, props: any = {}): ComponentAndProps {
  return { component, props }
}

export type ComponentFinder = (type: FomSchema, path: Path) => ComponentAndProps
export type ErrorComponentFinder = (path: Path) => ComponentAndProps

export const defaultComponentFinder: ComponentFinder = (type, path) => {
  if ((type as FomSchema).type === 'text') {
    return componentAndProps(TextInput)
  }
  if ((type as FomSchema).type === 'boolean') {
    return componentAndProps(CheckboxInput)
  }
  if ((type as FomSchema).type === 'enum') {
    return componentAndProps(SelectInput)
  }
  if ((type as FomSchema).type === 'array') {
    return componentAndProps(FomArrayContainer)
  }
  throw new Error(`No component found for type ${type.type} at path ${path.join('.')}`)
}

export const defaultErrorComponentFinder: ErrorComponentFinder = (path) => {
  return componentAndProps(ErrorAlert)
}
