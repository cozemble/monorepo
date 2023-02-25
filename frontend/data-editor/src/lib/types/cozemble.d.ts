/** To calculate the value of a field */
declare type Formula = (data: any) => Promise<any>

/** To render a custom component for a field */
declare type SimpleInputComponent = import('svelte').ComponentType<
  import('svelte').SvelteComponentTyped<{
    value: string | number | boolean
    error?: string
    readonly?: boolean
  }>
>

declare type ObjectEditorComponent = import('svelte').ComponentType<
  import('svelte').SvelteComponentTyped<{
    schema: CozJSONSchema
    value: ObjectValue
    errors?: ObjectError
  }>
>

declare interface JSONSchemaCozembleConfigs {
  properties?: Record<string, JSONSchemaCozembleConfigs>
  items?: JSONSchemaCozembleConfigs

  formula?: Formula
  customComponent?: SimpleInputComponent | ObjectEditorComponent
}

/** JSON Schema but cozemble specific configs are merged in place */
declare type CozJSONSchema = JSONSchema & JSONSchemaCozembleConfigs
