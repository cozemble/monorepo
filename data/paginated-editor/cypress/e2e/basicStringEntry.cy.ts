import {modelFns, modelOptions} from "@cozemble/model-api"
import {stringProperties, stringPropertyOptions} from "@cozemble/model-string-core";
import {pageEditorLocalStorageKey} from "../../src/routes/paginatedEditor/context";

describe('paginated editor', () => {
    beforeEach(() => {
        let model = modelFns.newInstance("Customer",
            modelOptions.withProperties(
                stringProperties.newInstance("First name", stringPropertyOptions.required),
                stringProperties.newInstance("Last name"),
                stringProperties.newInstance("Phone", stringPropertyOptions.unique, stringPropertyOptions.validation("^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$", "Must be a valid phone number")),
                stringProperties.newInstance("Email", stringPropertyOptions.unique, stringPropertyOptions.validation("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", "Must be a valid email address")))
        )
        localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(model))
    })
    it('permits basic string entry', () => {
      cy.visit('http://localhost:5173/paginatedEditor')
        // I can't click until I sort out model & property serialization
        // cy.get("button.add-record").click()
    })
})