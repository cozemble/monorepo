import { strings } from '@cozemble/lang-util'
import { gql } from './gql'

export interface GqlObject {
  _type: 'gql.object'
  values: ValueAssignment[]
  relationships: GqlRelationship[]
}

export function gqlObject(
  values: ValueAssignment[] = [],
  relationships: GqlRelationship[] = [],
): GqlObject {
  return {
    _type: 'gql.object',
    values,
    relationships,
  }
}

export const gqlObjectFns = {
  addValue(object: GqlObject, value: ValueAssignment): void {
    object.values.push(value)
  },
  addRelationship(object: GqlObject, relationship: GqlRelationship): void {
    object.relationships.push(relationship)
  },
}

export interface GqlReturningClause {
  _type: 'gql.returning.clause'
  value: string[]
}

export const gqlReturningClauseFns = {
  empty(): GqlReturningClause {
    return { _type: 'gql.returning.clause', value: [] }
  },
  addReturning(clause: GqlReturningClause, value: string): void {
    clause.value.push(strings.snakeCase(value))
  },
}

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
  returning: GqlReturningClause
  object: GqlObject
}

export function objectRelationship(
  name: string,
  returning: GqlReturningClause = gqlReturningClauseFns.empty(),
  object: GqlObject = gqlObject(),
): ObjectRelationship {
  return {
    _type: 'object.relationship',
    name: strings.snakeCase(name),
    returning,
    object,
  }
}

export interface ArrayRelationship {
  _type: 'array.relationship'
  name: string
  returning: GqlReturningClause
  objects: GqlObject[]
}

export function arrayRelationship(
  name: string,
  returning: GqlReturningClause = gqlReturningClauseFns.empty(),
  objects: GqlObject[] = [],
): ArrayRelationship {
  return {
    _type: 'array.relationship',
    name: strings.snakeCase(name),
    returning,
    objects,
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
      const myReturns = relationship.returning.value.map(line)
      const childReturns = relationship.object.relationships.flatMap((child) =>
        wrap(child.name, gqlRelationshipFns.printReturning(child)),
      )

      return [...myReturns, ...childReturns]
    } else {
      return relationship.returning.value.map(line)
    }
  },
  printSetStatement(relationship: GqlRelationship): string {
    if (relationship._type === 'object.relationship') {
      const valueAssignments = relationship.object.values
        .map((v) => `${v.name}: "${v.value}"`)
        .join(', ')
      const childAssignments = relationship.object.relationships.map(
        (r) => `${r.name}: {data: ${gqlRelationshipFns.printSetStatement(r)}}`,
      )
      return `{${[valueAssignments, ...childAssignments].join(', ')}}`
    } else {
      const setStatements = relationship.objects
        .map((item) => {
          return item.values.map((v) => `${v.name}: "${v.value}"`).join(', ')
        })
        .map((s) => `{${s}}`)
        .join(', ')
      return `[${setStatements}]`
    }
  },
}

export type GqlRequest = GqlMutation
