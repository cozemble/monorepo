import {coreModelEvents} from "@cozemble/model-event-sourced";
import {expect, test} from "vitest";
import {constraints, makeSqlActions} from "@cozemble/sql-actions";
import {propertyIdFns} from "@cozemble/model-core";
import {modelEventToSqlActions} from "../src/modelEventToSqlActions";
import {modelFns, modelIdFns} from "@cozemble/model-api";

const stubSqlActions = makeSqlActions(() => new Date(0), () => "id")
modelEventToSqlActions.setSqlActions(stubSqlActions)

test("model created event maps to a new table sql action", () => {
    const event = coreModelEvents.modelCreated("Customers")
    const actions = modelEventToSqlActions.apply([], modelIdFns.newInstance(), event)
    expect(actions).toMatchObject([stubSqlActions.newTable("Customers")])
})

test("model renamed event maps to a rename table sql action", () => {
    const event = coreModelEvents.modelRenamed("Customers", "Clients")
    const actions = modelEventToSqlActions.apply([], modelIdFns.newInstance(), event)
    expect(actions).toMatchObject([stubSqlActions.renameModel("Customers", "Clients")])
})

test("can rename a property", () => {
    const event = coreModelEvents.propertyRenamed("Customers", propertyIdFns.newInstance(), "Last Name", "Surname")
    const actions = modelEventToSqlActions.apply([], modelIdFns.newInstance(), event)
    expect(actions).toMatchObject([stubSqlActions.renameColumn("Customers", "Last Name", "Surname")])
})

// This is a guess for now, until I actually try it!
test("can add a has one relationship", () => {
    const customerModel = modelFns.newInstance("Customer")
    const addressModel = modelFns.newInstance("Address")
    const event = coreModelEvents.relationshipAdded("one", "Address", addressModel.id)
    const actions = modelEventToSqlActions.apply([customerModel, addressModel], customerModel.id, event)
    expect(actions).toMatchObject([
        stubSqlActions.newTable("Address"),
        stubSqlActions.addColumn("Customer", "Address ID"),
        stubSqlActions.changeColumnType("Customer", "Address ID", "text", "integer"),
        stubSqlActions.addColumnConstraint("Customer", "Address ID", constraints.fk("Address", "customerAddressFk"))
    ])
})

// This is a guess for now, until I actually try it!
test("can add a has many relationship", () => {
    const customerModel = modelFns.newInstance("Customer")
    const addressModel = modelFns.newInstance("Address")
    const event = coreModelEvents.relationshipAdded("many", "Addresses", addressModel.id)
    const actions = modelEventToSqlActions.apply([customerModel, addressModel], customerModel.id, event)
    expect(actions).toMatchObject([
        stubSqlActions.newTable("Address"),
        stubSqlActions.addColumn("Address", "Customer ID"),
        stubSqlActions.changeColumnType("Address", "Customer ID", "text", "integer"),
        stubSqlActions.addColumnConstraint("Address", "Customer ID", constraints.fk("Customer", "customerAddressFk"))
    ])
})