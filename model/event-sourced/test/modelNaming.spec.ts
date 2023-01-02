import {expect, test} from "vitest";
import {eventSourcedModelFns, modelRenamed} from "../src";

test("can rename a model", () => {
    let model = eventSourcedModelFns.newInstance("model1")
    expect(model.model.name).toBe("model1")

    model = eventSourcedModelFns.addEvent(model, modelRenamed("model2"))
    expect(model.model.name).toBe("model2")
})