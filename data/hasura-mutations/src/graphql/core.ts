import { gql } from '@cozemble/graphql-util'
import { strings } from '@cozemble/lang-util'

export interface ValueAssignment {
  name: string
  value: string
  type: 'string'
}

export function value(name: string, value: string): ValueAssignment {
  return {
    name: strings.snakeCase(name),
    value,
    type: 'string',
  }
}

export interface ObjectRelationship {
  _type: 'object.relationship'
  name: string
  returning: string[]
  values: ValueAssignment[]
  relationships: GqlRelationship[]
}

export function objectRelationship(
  name: string,
  values: ValueAssignment[] = [],
  returning: string[] = [],
  relationships: GqlRelationship[] = [],
): ObjectRelationship {
  return {
    _type: 'object.relationship',
    name: strings.snakeCase(name),
    returning,
    values,
    relationships,
  }
}

export interface ArrayRelationshipItem {
  _type: 'array.relationship.item'
  values: ValueAssignment[]
  relationships: GqlRelationship[]
}

export function item(
  values: ValueAssignment[] = [],
  relationships: GqlRelationship[] = [],
): ArrayRelationshipItem {
  return {
    _type: 'array.relationship.item',
    values,
    relationships,
  }
}

export interface ArrayRelationship {
  _type: 'array.relationship'
  name: string
  returning: string[]
  items: ArrayRelationshipItem[]
}

export function arrayRelationship(
  name: string,
  returning: string[] = [],
  items: ArrayRelationshipItem[] = [],
): ArrayRelationship {
  return {
    _type: 'array.relationship',
    name,
    returning,
    items,
  }
}

export type GqlRelationship = ObjectRelationship | ArrayRelationship

export interface GqlMutation {
  _type: 'gql.mutation'
  mutation: string
}

export function gqlMutation(mutation: string): GqlMutation {
  return {
    _type: 'gql.mutation',
    mutation: gql.parse(mutation),
  }
}

function wrap(name: string, lines: Line[]): Line[] {
  return [line(name + ' {'), ...lines.map((l) => addIndent(l)), line('}')]
}

function addIndent(line: Line): Line {
  return {
    ...line,
    indent: line.indent + 1,
  }
}

export interface Line {
  _type: 'line'
  value: string
  indent: number
}

function line(value: string): Line {
  return {
    _type: 'line',
    value,
    indent: 0,
  }
}

function printIndent(indent: number) {
  return '  '.repeat(indent)
}

export function printLines(lines: Line[]): string {
  return lines.map((l) => printIndent(l.indent) + l.value).join('\n')
}

export const gqlRelationshipFns = {
  printReturning(relationship: GqlRelationship): Line[] {
    if (relationship._type === 'object.relationship') {
      const myReturns = relationship.returning.map(line)
      const childReturns = relationship.relationships.flatMap((child) =>
        wrap(child.name, gqlRelationshipFns.printReturning(child)),
      )

      return [...myReturns, ...childReturns]
    } else {
      return relationship.returning.map(line)
    }
  },
  printSetStatement(relationship: GqlRelationship): string {
    if (relationship._type === 'object.relationship') {
      const valueAssignments = relationship.values.map((v) => `${v.name}: "${v.value}"`).join(', ')
      const childAssignments = relationship.relationships.map(
        (r) => `${r.name}: {data: ${gqlRelationshipFns.printSetStatement(r)}}`,
      )
      return `{${[valueAssignments, ...childAssignments].join(', ')}}`
    } else {
      const setStatements = relationship.items
        .map((item) => {
          return item.values.map((v) => `${v.name}: "${v.value}"`).join(', ')
        })
        .map((s) => `{${s}}`)
        .join(', ')
      return `[${setStatements}]`
    }
  },
  addReturning<T extends GqlRelationship>(relationship: T, returning: string): T {
    relationship.returning.push(strings.snakeCase(returning))
    return relationship
  },
  addValue(relationship: ObjectRelationship, value: ValueAssignment): ObjectRelationship {
    relationship.values.push(value)
    return relationship
  },
  getOrCreateObjectRelationship(
    relationship: ObjectRelationship,
    name: string,
  ): ObjectRelationship {
    name = strings.snakeCase(name)
    const maybe = relationship.relationships.find((r) => r.name === name)
    if (maybe) {
      if (maybe._type === 'object.relationship') {
        return maybe
      }
      throw new Error(`Relationship ${name} is not an object relationship`)
    }
    const obj = objectRelationship(name)
    relationship.relationships.push(obj)
    return {
      ...relationship,
      relationships: [...relationship.relationships, objectRelationship(name)],
    }
  },
}
