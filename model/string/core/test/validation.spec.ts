import {expect, test} from 'vitest'
import {stringProperties, stringPropertyDescriptor, stringPropertyOptions} from "../src";

test("required validation", () => {
    const requiredProperty = stringProperties.newInstance("name", stringPropertyOptions.required)
    expect(stringPropertyDescriptor.validateValue(requiredProperty, null)).toEqual(["Required"])
    expect(stringPropertyDescriptor.validateValue(requiredProperty, undefined)).toEqual(["Required"])
    expect(stringPropertyDescriptor.validateValue(requiredProperty, "")).toEqual(["Required"])
    expect(stringPropertyDescriptor.validateValue(requiredProperty, "Mike")).toHaveLength(0)
})