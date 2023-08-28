import type { FomSchema } from './Fom'
import { z } from 'zod'

export function zodToFom(zod: z.ZodType<any, any>): FomSchema {
  if (zod instanceof z.ZodObject) {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(zod.shape).map(([k, v]) => {
          if (v instanceof z.ZodType) {
            return [k, zodToFom(v)]
          }
          throw new Error(`Unsupported zod type ${v}`)
        }),
      ),
    }
  } else if (zod instanceof z.ZodArray) {
    return {
      type: 'array',
      element: zodToFom(zod.element),
    }
  } else if (zod instanceof z.ZodDiscriminatedUnion) {
    const discriminator = zod._def.discriminator
    const options = zod._def.options

    return {
      type: 'discriminatedUnion',
      discriminator,
      options: options.map((option) => zodToFom(option)),
    }
  } else if (zod instanceof z.ZodLiteral) {
    return {
      type: 'literal',
      value: zod._def.value,
    }
  } else if (zod instanceof z.ZodEnum) {
    return {
      type: 'enum',
      options: zod._def.values,
    }
  } else if (zod instanceof z.ZodDefault) {
    return {
      type: 'default',
      value: zod._def.defaultValue(),
      innerSchema: zodToFom(zod._def.innerType),
    }
  } else if (zod instanceof z.ZodString) {
    return {
      type: 'text',
    }
  } else if (zod instanceof z.ZodBoolean) {
    return {
      type: 'boolean',
    }
  } else {
    throw new Error(`Unsupported zod type ${zod}`)
  }
}
