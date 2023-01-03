import {expect, test} from 'vitest'
import {dataRecordFns, modelFns, modelOptions} from "../src";
import {stringPropertyOptions} from "@cozemble/model-string-core";
import {registerStringProperty} from "@cozemble/model-string-core";
import {stringPropertyFns} from "@cozemble/model-string-core";

registerStringProperty()

test("validate a model with a required string", () => {
    const requiredProperty = stringPropertyFns.newInstance("name", stringPropertyOptions.required)
    const model = modelFns.newInstance("Customer", modelOptions.withProperty(requiredProperty))
    const record = dataRecordFns.newInstance(model, "test-user")
    const errors = modelFns.validate(model, record)
    expect(errors).toEqual(new Map([[requiredProperty.id.id, ["Required"]]]))
})