import { emptyModel } from "@cozemble/model-core";
import {expect, test} from "vitest";
import {newStringPropertyModelEvent} from "../src";
import {newStringPropertyModelEventDescriptor} from "../src/events";

test("adding a new string property with existing ID", () => {
    const model = emptyModel("My Model")
    const event = newStringPropertyModelEvent("property22")
    const newModel = newStringPropertyModelEventDescriptor.applyEvent(model, event)
    expect(newModel.properties).toHaveLength(1)
    expect(newModel.properties[0].name).toEqual("Property #1")
    expect(newModel.properties[0].id.id).toEqual(event.propertyId.id)
})

test("adding a new string property with new ID", () => {
    const model = emptyModel("My Model")
    const event = newStringPropertyModelEvent()
    const newModel = newStringPropertyModelEventDescriptor.applyEvent(model, event)
    expect(newModel.properties).toHaveLength(1)
    expect(newModel.properties[0].name).toEqual("Property #1")
    expect(newModel.properties[0].id.id).toBeDefined()
})