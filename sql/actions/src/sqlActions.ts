import { strings } from '@cozemble/lang-util'
import { nanoid } from 'nanoid'

export type ColumnType = 'text' | 'jsonb' | 'integer' | 'timestamp' | 'boolean'

export interface NewTableAction {
  _type: 'new.table'
  meta: SqlActionMeta
  tableName: TableName
}

export interface RenameTableAction {
  _type: 'rename.table'
  meta: SqlActionMeta
  oldName: TableName
  newName: TableName
}

export class SqlName {
  private readonly _value: string

  constructor(name: string) {
    this._value = strings.snakeCase(name)
  }

  value(): string {
    return this._value
  }

  toString(): string {
    return this._value
  }
}

export type ColumnName = SqlName

export function columnName(name: string): ColumnName {
  return new SqlName(name)
}

class TableName {
  private readonly _name: SqlName

  constructor(name: string) {
    this._name = new SqlName(name)
  }

  fqn(schema: Schema): string {
    return `${schema.name}.${this.n()}`
  }

  n(): string {
    return this._name.value()
  }
}

export function tableName(name: string): TableName {
  return new TableName(name)
}

export interface AddColumnAction {
  _type: 'add.column'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
}

export interface RenameColumnAction {
  _type: 'rename.column'
  meta: SqlActionMeta
  tableName: TableName
  oldColumnName: ColumnName
  newColumnName: ColumnName
}

export interface ChangeColumnTypeAction {
  _type: 'change.column.type'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
  oldType: ColumnType
  newType: ColumnType
}

export interface MakeColumnNonNullableAction {
  _type: 'make.column.non.nullable'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
}

export interface MakeColumnNullableAction {
  _type: 'make.column.nullable'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
}

export interface SetColumnDefaultAction {
  _type: 'set.column.default'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
  defaultValue: string | number | boolean | Date
}

export interface DropColumnDefaultAction {
  _type: 'drop.column.default'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
  defaultValue: string | number | boolean | Date
}

export interface AddColumnConstraintAction {
  _type: 'add.column.constraint'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
  constraint: Constraint
}

export interface DropColumnConstraintAction {
  _type: 'drop.column.constraint'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
  constraint: Constraint
}

export interface SetColumnToSequenceValueAction {
  _type: 'set.column.to.sequence.value'
  meta: SqlActionMeta
  tableName: TableName
  columnName: ColumnName
  current: CurrentColumnConfiguration
  name: SequenceName
}

export interface SetSequenceStartingValueAction {
  _type: 'set.sequence.starting.value'
  meta: SqlActionMeta
  name: SequenceName
  currentStartingValue: number
  newStartingValue: number
}

export type SqlActionMeta = { id: string; timestamp: number; description: string }

export type SqlAction =
  | NewTableAction
  | RenameTableAction
  | AddColumnAction
  | RenameColumnAction
  | ChangeColumnTypeAction
  | MakeColumnNonNullableAction
  | MakeColumnNullableAction
  | SetColumnDefaultAction
  | DropColumnDefaultAction
  | AddColumnConstraintAction
  | DropColumnConstraintAction
  | SetColumnToSequenceValueAction
  | SetSequenceStartingValueAction

export interface UniqueConstraint {
  _type: 'unique.constraint'
  constraintName: string
}

export interface ForeignKeyConstraint {
  _type: 'foreign.key.constraint'
  tableName: TableName
  constraintName: string
}

export interface SequenceName {
  _type: 'sequence.name'
  name: string
}

export function sequenceName(name: string): SequenceName {
  return { _type: 'sequence.name', name }
}

export type Constraint = UniqueConstraint | ForeignKeyConstraint

export const constraints = {
  unique: function (constraintName: string): UniqueConstraint {
    return { _type: 'unique.constraint', constraintName }
  },
  fk: function (tn: string, constraintName: string): ForeignKeyConstraint {
    return { _type: 'foreign.key.constraint', tableName: tableName(tn), constraintName }
  },
}

export type DefaultValueType = string | number | boolean | Date
export type CurrentColumnConfiguration = {
  currentType: ColumnType
  currentNullable: boolean
  currentHasDefault: boolean
  currentDefault?: DefaultValueType
}

export class SqlActions {
  constructor(private readonly clock: () => Date, private readonly idMaker: () => string) {}

  newTable(name: string): NewTableAction {
    return {
      _type: 'new.table',
      tableName: tableName(name),
      meta: this._makeMeta(`new.table.${name}`),
    }
  }

  renameModel(oldName: string, newName: string): RenameTableAction {
    return {
      _type: 'rename.table',
      oldName: tableName(oldName),
      newName: tableName(newName),
      meta: this._makeMeta(`rename.table.from.${oldName}.to.${newName}`),
    }
  }

  addColumn(tn: string, theColumnName: string): AddColumnAction {
    const name = columnName(theColumnName)
    return {
      _type: 'add.column',
      tableName: tableName(tn),
      columnName: name,
      meta: this._makeMeta(`add.column.${name.value()}.to.table.${tn}`),
    }
  }

  renameColumn(tn: string, oldColumnName: string, newColumnName: string): RenameColumnAction {
    const old = columnName(oldColumnName)
    const _new = columnName(newColumnName)
    return {
      _type: 'rename.column',
      tableName: tableName(tn),
      oldColumnName: old,
      newColumnName: _new,
      meta: this._makeMeta(`rename.column.${old.value()}.to.${_new.value()}`),
    }
  }

  changeColumnType(
    tn: string,
    theColumnName: string,
    oldType: ColumnType,
    newType: ColumnType,
  ): ChangeColumnTypeAction {
    const name = columnName(theColumnName)
    return {
      _type: 'change.column.type',
      tableName: tableName(tn),
      columnName: name,
      oldType,
      newType,
      meta: this._makeMeta(
        `change.type.of.column.${tn}.${name.value()}.from.${oldType}.to.${newType}`,
      ),
    }
  }

  makeColumnNonNullable(tn: string, theColumnName: string): MakeColumnNonNullableAction {
    const name = columnName(theColumnName)
    return {
      _type: 'make.column.non.nullable',
      tableName: tableName(tn),
      columnName: name,
      meta: this._makeMeta(`make.${tn}.${name.value()}.non.nullable`),
    }
  }

  makeColumnNullable(tn: string, theColumnName: string): MakeColumnNullableAction {
    const name = columnName(theColumnName)
    return {
      _type: 'make.column.nullable',
      tableName: tableName(tn),
      columnName: name,
      meta: this._makeMeta(`make.${tn}.${name.value()}.nullable`),
    }
  }

  setColumnDefault(
    tn: string,
    theColumnName: string,
    defaultValue: DefaultValueType,
  ): SetColumnDefaultAction {
    const name = columnName(theColumnName)
    return {
      _type: 'set.column.default',
      tableName: tableName(tn),
      columnName: name,
      defaultValue,
      meta: this._makeMeta(`set.default.for.${tn}.${name.value()}.to.${defaultValue}`),
    }
  }

  dropColumnDefault(
    tn: string,
    theColumnName: string,
    defaultValue: DefaultValueType,
  ): DropColumnDefaultAction {
    const name = columnName(theColumnName)

    return {
      _type: 'drop.column.default',
      tableName: tableName(tn),
      columnName: name,
      defaultValue,
      meta: this._makeMeta(`drop.default.for.${tn}.${name.value()}.to.${defaultValue}`),
    }
  }

  addColumnConstraint(
    tn: string,
    theColumnName: string,
    constraint: Constraint,
  ): AddColumnConstraintAction {
    const name = columnName(theColumnName)

    return {
      _type: 'add.column.constraint',
      tableName: tableName(tn),
      columnName: name,
      constraint,
      meta: this._makeMeta(
        `add.${constraint._type}.constraint.for.${tn}.${name.value()}.named.${
          constraint.constraintName
        }`,
      ),
    }
  }

  dropColumnConstraint(
    tn: string,
    theColumnName: string,
    constraint: Constraint,
  ): DropColumnConstraintAction {
    const name = columnName(theColumnName)

    return {
      _type: 'drop.column.constraint',
      tableName: tableName(tn),
      columnName: name,
      constraint,
      meta: this._makeMeta(
        `drop.${constraint._type}.constraint.for.${tn}.${name.value()}.named.${
          constraint.constraintName
        }`,
      ),
    }
  }

  setColumnToSequenceValue(
    tn: string,
    theColumnName: string,
    current: CurrentColumnConfiguration,
    sequenceName: SequenceName,
  ): SetColumnToSequenceValueAction {
    const name = columnName(theColumnName)
    return {
      _type: 'set.column.to.sequence.value',
      tableName: tableName(tn),
      columnName: name,
      name: sequenceName,
      current,
      meta: this._makeMeta(`set.${tn}.${name.value()}.to.sequence.named.${sequenceName.name}`),
    }
  }

  setSequenceStartingValue(
    name: SequenceName,
    currentStartingValue: number,
    newStartingValue: number,
  ): SetSequenceStartingValueAction {
    return {
      _type: 'set.sequence.starting.value',
      name,
      currentStartingValue,
      newStartingValue,
      meta: this._makeMeta(`set.sequence.${name.name}.to.starting.value.${newStartingValue}`),
    }
  }

  private _makeMeta(description: string): SqlActionMeta {
    return { id: this.idMaker(), timestamp: this.clock().getTime(), description }
  }
}

export function makeSqlActions(clock = () => new Date(), idMaker = () => nanoid()): SqlActions {
  return new SqlActions(clock, idMaker)
}

export interface SqlMigration {
  _type: 'sql.migration'
  up: string[]
  down: string[]
}

export function sqlMigration(up: string[], down: string[]): SqlMigration {
  return { _type: 'sql.migration', up, down }
}

export function actionToSql(theSchema: Schema, action: SqlAction): SqlMigration {
  if (action._type === 'new.table') {
    // @formatter:off
    const up = [`CREATE TABLE ${action.tableName.fqn(theSchema)}(id SERIAL PRIMARY KEY);`]
    const down = [`DROP TABLE ${action.tableName.fqn(theSchema)};`]
    // @formatter:on
    return sqlMigration(up, down)
  }
  if (action._type === 'rename.table') {
    // @formatter:off
    const up = `ALTER TABLE ${action.oldName.fqn(theSchema)} RENAME TO ${action.newName.n()};`
    const down = `ALTER TABLE ${action.newName.fqn(theSchema)} RENAME TO ${action.oldName.n()};`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'add.column') {
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} ADD ${action.columnName} text;`
    const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} DROP COLUMN ${action.columnName};`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'rename.column') {
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} RENAME ${action.oldColumnName} TO ${
      action.newColumnName
    };`
    const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} RENAME ${
      action.newColumnName
    } TO ${action.oldColumnName};`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'change.column.type') {
    if (action.oldType === 'text' && action.newType === 'integer') {
      // @formatter:off
      const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
        action.columnName
      } TYPE ${action.newType} USING (trim(${action.columnName})::integer);`
      const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
        action.columnName
      } TYPE ${action.oldType};`
      // @formatter:on
      return sqlMigration([up], [down])
    }
    throw new Error(`To do: support column type change from ${action.oldType} to ${action.newType}`)
  }
  if (action._type === 'make.column.non.nullable') {
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } SET NOT NULL;`
    const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } DROP NOT NULL;`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'make.column.nullable') {
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } DROP NOT NULL;`
    const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } SET NOT NULL;`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'set.column.default') {
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } SET DEFAULT '${action.defaultValue}';`
    const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } DROP DEFAULT;`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'drop.column.default') {
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } DROP DEFAULT;`
    const down = `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
      action.columnName
    } SET DEFAULT '${action.defaultValue}';`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  if (action._type === 'add.column.constraint') {
    if (action.constraint._type === 'unique.constraint') {
      // @formatter:off
      return sqlMigration(
        [
          `ALTER TABLE ${action.tableName.fqn(theSchema)} ADD CONSTRAINT ${
            action.constraint.constraintName
          } UNIQUE (${action.columnName});`,
        ],
        [
          `ALTER TABLE ${action.tableName.fqn(theSchema)} DROP CONSTRAINT ${
            action.constraint.constraintName
          };`,
        ],
      )
      // @formatter:on
    } else {
      // @formatter:off
      return sqlMigration(
        [
          `ALTER TABLE ${action.tableName.fqn(theSchema)} ADD CONSTRAINT ${
            action.constraint.constraintName
          } FOREIGN KEY (${action.columnName}) REFERENCES ${action.constraint.tableName.fqn(
            theSchema,
          )} (id);`,
        ],
        [
          `ALTER TABLE ${action.tableName.fqn(theSchema)} DROP CONSTRAINT ${
            action.constraint.constraintName
          };`,
        ],
      )
      // @formatter:on
    }
  }
  if (action._type === 'drop.column.constraint') {
    action.meta.timestamp
    const addConstraintMigration = actionToSql(theSchema, {
      _type: 'add.column.constraint',
      tableName: action.tableName,
      columnName: action.columnName,
      constraint: action.constraint,
      meta: {
        id: 'Rollback-of-' + action.meta.id,
        timestamp: action.meta.timestamp,
        description: 'Rollback : ' + action.meta.description,
      },
    })
    // @formatter:off
    const up = `ALTER TABLE ${action.tableName.fqn(theSchema)} DROP CONSTRAINT ${
      action.constraint.constraintName
    };`
    // @formatter:on
    return sqlMigration([up], addConstraintMigration.up)
  }
  if (action._type === 'set.column.to.sequence.value') {
    // @formatter:off
    return sqlMigration(
      [
        `CREATE SEQUENCE ${theSchema.name}.${action.name.name};`,
        `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
          action.columnName
        } TYPE integer NOT NULL DEFAULT nextval('${theSchema.name}.${action.name.name}');`,
        `ALTER SEQUENCE ${theSchema.name}.${action.name.name} OWNED BY ${action.tableName.fqn(
          theSchema,
        )}.${action.columnName};`,
      ],
      [
        `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${action.columnName} TYPE ${
          action.current.currentType
        };`,
        action.current.currentNullable
          ? `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
              action.columnName
            } DROP NOT NULL;`
          : '',
        action.current.currentHasDefault
          ? `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
              action.columnName
            } SET DEFAULT '${action.current.currentDefault}';`
          : `ALTER TABLE ${action.tableName.fqn(theSchema)} ALTER COLUMN ${
              action.columnName
            } DROP DEFAULT;`,
        `DROP SEQUENCE ${theSchema.name}.${action.name.name};`,
      ],
    )
    // @formatter:on
  }
  if (action._type === 'set.sequence.starting.value') {
    // @formatter:off
    const up = `ALTER SEQUENCE ${theSchema.name}.${action.name.name} START WITH ${action.newStartingValue};`
    const down = `ALTER SEQUENCE ${theSchema.name}.${action.name.name} START WITH ${action.currentStartingValue};`
    // @formatter:on
    return sqlMigration([up], [down])
  }
  return sqlMigration([], [])
}

export interface Schema {
  _type: 'schema'
  name: string
}

export function schema(name: string): Schema {
  return { _type: 'schema', name }
}

export const sqlActionOps = {
  migrationName: function (action: SqlAction): string {
    return `${action.meta.timestamp}.${action.meta.id}.${action.meta.description}`
  },
}
