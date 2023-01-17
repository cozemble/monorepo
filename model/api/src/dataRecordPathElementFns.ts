import type { DataRecordPathElement, DottedPath } from '@cozemble/model-core'

export const dataRecordPathElementFns = {
  toDottedNamePath(elements: DataRecordPathElement[]): DottedPath {
    return {
      _type: 'dotted.path',
      partType: 'name',
      value: elements
        .map((element) => {
          if (element._type === 'has.many.relationship.path.element') {
            return element.relationship.name.value
          }
          return element.name.value
        })
        .join('.'),
    }
  },
}
