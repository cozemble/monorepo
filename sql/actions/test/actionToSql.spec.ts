import {
  actionToSql,
  constraints,
  makeSqlActions,
  schema,
  sequenceName,
  sqlMigration,
} from '../src'
import { expect, test } from 'vitest'

const theSchema = schema('teamx')
const sqlActions = makeSqlActions()

test('can create an empty table', () => {
  const action = sqlActions.newTable('Customer')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['CREATE TABLE teamx.customer(id TEXT PRIMARY KEY);'],
      ['DROP TABLE teamx.customer;'],
    ),
  )
})

test('table names have snake case', () => {
  const action = sqlActions.newTable('Delivery Address')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['CREATE TABLE teamx.delivery_address(id TEXT PRIMARY KEY);'],
      ['DROP TABLE teamx.delivery_address;'],
    ),
  )
})

test('can rename a table', () => {
  const action = sqlActions.renameModel('Customer', 'Client')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer RENAME TO client;'],
      ['ALTER TABLE teamx.client RENAME TO customer;'],
    ),
  )
})

test('can add a column to a table, which is text by default', () => {
  const action = sqlActions.addColumn('Customer', 'column_a')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer ADD column_a text;'],
      ['ALTER TABLE teamx.customer DROP COLUMN column_a;'],
    ),
  )
})

test('can add a boolean column to a table', () => {
  const action = sqlActions.addColumn('Customer', 'column_a', 'boolean')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer ADD column_a boolean;'],
      ['ALTER TABLE teamx.customer DROP COLUMN column_a;'],
    ),
  )
})

test('can rename a column', () => {
  const action = sqlActions.renameColumn('Customer', 'column_a', 'column_b')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer RENAME column_a TO column_b;'],
      ['ALTER TABLE teamx.customer RENAME column_b TO column_a;'],
    ),
  )
})

test('can change the data type of a column', () => {
  const action = sqlActions.changeColumnType('Customer', 'column_a', 'text', 'integer')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      [
        'ALTER TABLE teamx.customer ALTER COLUMN column_a TYPE integer USING (trim(column_a)::integer);',
      ],
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a TYPE text;'],
    ),
  )
})

test('can make a column not null', () => {
  const action = sqlActions.makeColumnNonNullable('Customer', 'column_a')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a SET NOT NULL;'],
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a DROP NOT NULL;'],
    ),
  )
})

test('can make a column null', () => {
  const action = sqlActions.makeColumnNullable('Customer', 'column_a')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a DROP NOT NULL;'],
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a SET NOT NULL;'],
    ),
  )
})

test('can assign a default value to a column', () => {
  const action = sqlActions.setColumnDefault('Customer', 'column_a', 'defaultValue')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ["ALTER TABLE teamx.customer ALTER COLUMN column_a SET DEFAULT 'defaultValue';"],
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a DROP DEFAULT;'],
    ),
  )
})

test('can drop default value from a column', () => {
  const action = sqlActions.dropColumnDefault('Customer', 'column_a', 'defaultValue')
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer ALTER COLUMN column_a DROP DEFAULT;'],
      ["ALTER TABLE teamx.customer ALTER COLUMN column_a SET DEFAULT 'defaultValue';"],
    ),
  )
})

test('can add a unique constraint to a column', () => {
  const action = sqlActions.addColumnConstraint(
    'Customer',
    'column_a',
    constraints.unique('constraintName'),
  )
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer ADD CONSTRAINT constraintName UNIQUE (column_a);'],
      ['ALTER TABLE teamx.customer DROP CONSTRAINT constraintName;'],
    ),
  )
})

test('can drop a constraint from a column', () => {
  const action = sqlActions.dropColumnConstraint(
    'Customer',
    'column_a',
    constraints.unique('constraintName'),
  )
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER TABLE teamx.customer DROP CONSTRAINT constraintName;'],
      ['ALTER TABLE teamx.customer ADD CONSTRAINT constraintName UNIQUE (column_a);'],
    ),
  )
})

test('can assign a column value to a sequence', () => {
  const action = sqlActions.setColumnToSequenceValue(
    'Customer',
    'columnA',
    {
      currentType: 'text',
      currentNullable: true,
      currentHasDefault: true,
      currentDefault: 'x',
    },
    sequenceName('theSequenceName'),
  )
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      [
        'CREATE SEQUENCE teamx.theSequenceName;',
        "ALTER TABLE teamx.customer ALTER COLUMN column_a TYPE integer NOT NULL DEFAULT nextval('teamx.theSequenceName');",
        'ALTER SEQUENCE teamx.theSequenceName OWNED BY teamx.customer.column_a;',
      ],
      [
        'ALTER TABLE teamx.customer ALTER COLUMN column_a TYPE text;',
        'ALTER TABLE teamx.customer ALTER COLUMN column_a DROP NOT NULL;',
        "ALTER TABLE teamx.customer ALTER COLUMN column_a SET DEFAULT 'x';",
        'DROP SEQUENCE teamx.theSequenceName;',
      ],
    ),
  )
})

test('can set the starting value of a sequence', () => {
  const action = sqlActions.setSequenceStartingValue(sequenceName('theSequenceName'), 0, 405)
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      ['ALTER SEQUENCE teamx.theSequenceName START WITH 405;'],
      ['ALTER SEQUENCE teamx.theSequenceName START WITH 0;'],
    ),
  )
})

test('can add a foreign key column', () => {
  const action = sqlActions.addColumnConstraint(
    'Customer',
    'deliveryAddress',
    constraints.fk('Address', 'customerDeliveryAddressFK'),
  )
  const mutation = actionToSql(theSchema, action)
  expect(mutation).toMatchObject(
    sqlMigration(
      [
        'ALTER TABLE teamx.customer ADD CONSTRAINT customerDeliveryAddressFK FOREIGN KEY (delivery_address) REFERENCES teamx.address (id);',
      ],
      ['ALTER TABLE teamx.customer DROP CONSTRAINT customerDeliveryAddressFK;'],
    ),
  )
})
