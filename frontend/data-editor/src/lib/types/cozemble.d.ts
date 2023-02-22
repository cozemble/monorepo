/** To calculate the value of a field */
declare type Formula = (data: JSONObject) => Promise<any>

/** To render a custom component for a field */
declare type SimpleInputComponent = import('svelte').ComponentType<
  import('svelte').SvelteComponentTyped<{
    value: string
    error?: string
    readonly?: boolean
  }>
>

declare interface JSONSchemaCozembleConfigs {
  properties?: Record<string, JSONSchemaCozembleConfigs>
  items?: JSONSchemaCozembleConfigs

  formula?: Formula
  customComponent?: SimpleInputComponent
}

/** JSON Schema but cozemble specific configs are merged in place */
declare type CozJSONSchema = JSONSchema & JSONSchemaCozembleConfigs
