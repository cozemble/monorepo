declare type SimpleValue = string | number | boolean | null | undefined

declare type ArrayValue = Array<SimpleValue | ObjectValue | ArrayValue> | never[]

declare interface ObjectValue {
  [key: string]: SimpleValue | ObjectValue | ArrayValue
}

declare type AnyValue = SimpleValue | ObjectValue | ArrayValue
