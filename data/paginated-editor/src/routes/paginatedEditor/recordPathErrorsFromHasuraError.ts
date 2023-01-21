const _sample = [
  {
    extensions: {
      code: 'constraint-violation',
      path: '$.selectionSet.insert_invoice.args.objects[0].customer.data.address.data',
    },
    message: 'Not-NULL violation. null value in column "id" violates not-null constraint',
  },
]

export interface HasuraError {
  extensions: {
    code: string
    path: string
  }
  message: string
}

export function modelLevelHasuraErrors(errors: HasuraError[]): string[] {
  return errors.map((e) => `${e.extensions.path}: ${e.message}`)
}
