import {pageEditorLocalStorageKey} from "../../src/routes/paginatedEditor/context";
import {customerModel} from "./customerModel";

describe('paginated editor', () => {
    beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(customerModel)))

    it('performs validation as configured by properties', () => {
        cy.visit('http://localhost:5173/paginatedEditor')
        cy.get("button.add-record").click()
        cy.get("button.save").click()
        cy.get('td[data-cell-index="0-0"] .validation-errors').should('contain.text', 'Required')
        cy.get('td[data-cell-index="0-0"]').click({force: true})
        cy.get('td[data-cell-index="0-0"]').trigger('keyup', {key: "Enter"})
        cy.get('div.value-container').type("Mike")
        cy.get("button.save").click()
        cy.get('td[data-cell-index="0-0"] .validation-errors').should('not.exist')
    })
})