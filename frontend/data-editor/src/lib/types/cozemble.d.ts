/** To calculate the value of a field */
declare type Formula = (data: any) => Promise<any>

declare interface JSONSchemaCozembleConfigs {
  properties?: Record<string, JSONSchemaCozembleConfigs>
  formula?: Formula
}
