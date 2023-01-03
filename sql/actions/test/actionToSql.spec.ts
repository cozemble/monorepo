import {actionToSql, constraints, makeSqlActions, schema, sequenceName, sqlMigration} from "../src/sqlActions";
import {expect, test} from "vitest";

const theSchema = schema("teamx")
const sqlActions = makeSqlActions()

test("can create an empty table", () => {
    const action = sqlActions.newTable("Customer")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["CREATE TABLE teamx.customer(id SERIAL PRIMARY KEY);"], ["DROP TABLE teamx.customer;"]))
})

test("can rename a table", () => {
    const action = sqlActions.renameModel("Customer", "Client")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer RENAME TO client;"], ["ALTER TABLE teamx.client RENAME TO customer;"]))
})

test("can add a column to a table", () => {
    const action = sqlActions.addColumn("Customer", "columnA")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ADD columnA text;"], ["ALTER TABLE teamx.customer DROP COLUMN columnA;"]))
})

test("can rename a column", () => {
    const action = sqlActions.renameColumn("Customer", "columnA", "columnB")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer RENAME columnA TO columnB;"], ["ALTER TABLE teamx.customer RENAME columnB TO columnA;"]))
})

test("can change the data type of a column", () => {
    const action = sqlActions.changeColumnType("Customer", "columnA", "text", "integer")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ALTER COLUMN columnA TYPE integer USING (trim(columnA)::integer);"], ["ALTER TABLE teamx.customer ALTER COLUMN columnA TYPE text;"]))
})

test("can make a column not null", () => {
    const action = sqlActions.makeColumnNonNullable("Customer", "columnA")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ALTER COLUMN columnA SET NOT NULL;"], ["ALTER TABLE teamx.customer ALTER COLUMN columnA DROP NOT NULL;"]))
})

test("can make a column null", () => {
    const action = sqlActions.makeColumnNullable("Customer", "columnA")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ALTER COLUMN columnA DROP NOT NULL;"], ["ALTER TABLE teamx.customer ALTER COLUMN columnA SET NOT NULL;"]))
})

test("can assign a default value to a column", () => {
    const action = sqlActions.setColumnDefault("Customer", "columnA", "defaultValue")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ALTER COLUMN columnA SET DEFAULT 'defaultValue';"], ["ALTER TABLE teamx.customer ALTER COLUMN columnA DROP DEFAULT;"]))
})

test("can drop default value from a column", () => {
    const action = sqlActions.dropColumnDefault("Customer", "columnA", "defaultValue")
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ALTER COLUMN columnA DROP DEFAULT;"], ["ALTER TABLE teamx.customer ALTER COLUMN columnA SET DEFAULT 'defaultValue';"]))
})

test("can add a unique constraint to a column", () => {
    const action = sqlActions.addColumnConstraint("Customer", "columnA", constraints.unique("constraintName"))
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ADD CONSTRAINT constraintName UNIQUE (columnA);"], ["ALTER TABLE teamx.customer DROP CONSTRAINT constraintName;"]))
})

test("can drop a constraint from a column", () => {
    const action = sqlActions.dropColumnConstraint("Customer", "columnA", constraints.unique("constraintName"))
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer DROP CONSTRAINT constraintName;"], ["ALTER TABLE teamx.customer ADD CONSTRAINT constraintName UNIQUE (columnA);"]))
})


test("can assign a column value to a sequence", () => {
    const action = sqlActions.setColumnToSequenceValue("Customer", "columnA", {
        currentType: "text",
        currentNullable: true,
        currentHasDefault: true,
        currentDefault: "x"
    }, sequenceName("theSequenceName"))
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(
        [
            "CREATE SEQUENCE teamx.theSequenceName;",
            "ALTER TABLE teamx.customer ALTER COLUMN columnA TYPE integer NOT NULL DEFAULT nextval('teamx.theSequenceName');",
            "ALTER SEQUENCE teamx.theSequenceName OWNED BY teamx.customer.columnA;"],
        [
            "ALTER TABLE teamx.customer ALTER COLUMN columnA TYPE text;",
            "ALTER TABLE teamx.customer ALTER COLUMN columnA DROP NOT NULL;",
            "ALTER TABLE teamx.customer ALTER COLUMN columnA SET DEFAULT 'x';",
            "DROP SEQUENCE teamx.theSequenceName;"
        ]))
})

test("can set the starting value of a sequence", () => {
    const action = sqlActions.setSequenceStartingValue(sequenceName("theSequenceName"), 0, 405)
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER SEQUENCE teamx.theSequenceName START WITH 405;"],["ALTER SEQUENCE teamx.theSequenceName START WITH 0;"]))
})

test("can add a foreign key column", () => {
    const action = sqlActions.addColumnConstraint("Customer", "deliveryAddress", constraints.fk("Address", "customerDeliveryAddressFK"))
    const mutation = actionToSql(theSchema, action)
    expect(mutation).toMatchObject(sqlMigration(["ALTER TABLE teamx.customer ADD CONSTRAINT customerDeliveryAddressFK FOREIGN KEY (deliveryAddress) REFERENCES teamx.address (id);"],["ALTER TABLE teamx.customer DROP CONSTRAINT customerDeliveryAddressFK;"]))
})