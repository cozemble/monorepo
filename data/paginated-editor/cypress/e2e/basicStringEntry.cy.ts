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
    it('permits basic data entry by tabbing', () => {
        cy.visit('http://localhost:5173/paginatedEditor')
        cy.get("button.add-record").click()
        cy.get('td[data-cell-index="0-0"]').click({force: true})
        cy.get('td[data-cell-index="0-0"]').trigger('keyup', {key: "Enter"})
        cy.get('div.value-container').type("Mike")
        cy.get('div.value-container').trigger('keydown', {key: "Tab"})
        cy.get('div.value-container').type("Smith")
        cy.get('div.value-container').trigger('keydown', {key: "Tab"})
        cy.get('div.value-container').type("555-555-5555")
        cy.get('div.value-container').trigger('keydown', {key: "Tab"})
        cy.get('div.value-container').type("mike.smith@gmail.com")
        cy.get('div.value-container').trigger('keydown', {key: "Enter"})
    })
})