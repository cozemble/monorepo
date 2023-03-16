declare type SimpleValue = string | number | boolean | null | undefined

declare type ArrayValue = AnyValue[]

declare interface ObjectValue {
  [key: string]: SimpleValue | ObjectValue | ArrayValue
}

declare type AnyValue = SimpleValue | ObjectValue | ArrayValue
