import { clickAddSubtable } from './helpers'

describe('data table', () => {
  it('supports supports creating a new root record from a model reference slot', () => {
    cy.visit('http://localhost:5173/empty')
    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Invoice{enter}')
    cy.get('.edit-field-1').click()
    cy.get('input.property-name').type('{selectall}Invoice number')
    cy.get('input.required-toggle').click()
    cy.get('button.save-property').click()
    clickAddSubtable()
    cy.focused().type('Line items{enter}')
    cy.get('.edit-field-1').eq(1).click()
    cy.get('input.property-name').type('{selectall}Item name')
    cy.get('input.required-toggle').click()
    cy.get('button.save-property').click()

    cy.contains('Add Line items').click()
    cy.get('button.cancel').click()

    cy.contains('Add Line items').click()
    cy.get('button.save').click()
    cy.get('[data-cell-index="0-0"]').should('contain', 'Required')
    cy.get('button.cancel').click()

    cy.contains('Add Line items').click()
    cy.focused().should('have.attr', 'contenteditable', 'true')
    cy.focused().type('20 Typewriters').realPress('Tab')
    cy.get('button.save').click()
    cy.get('[data-cell-index="0-0"]').should('contain', '20 Typewriters')
    cy.get('button.save-root-record').click()
    cy.get('[data-cell-index="0-0"]').should('contain', 'Required')

    cy.get('[data-cell-index="0-0"]').eq(0).click().realPress('Enter')
    cy.focused().should('have.attr', 'contenteditable', 'true')
    cy.focused().type('Invoice #23').realPress('Tab')
    cy.get('button.save-root-record').click()
    cy.get('[data-cell-index="0-0"]').should('contain', 'Invoice #23')
  })
})
