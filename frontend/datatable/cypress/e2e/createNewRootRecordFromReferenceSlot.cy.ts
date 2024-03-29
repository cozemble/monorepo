import { clickAddField } from './helpers'

describe('data table', () => {
  it('supports supports creating a new root record from a model reference slot', () => {
    cy.visit('http://localhost:5173/empty')
    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Customers{enter}')
    cy.get('.edit-field-1').click()
    cy.get('input.property-name').type('{selectall}First name')
    cy.get('input.required-toggle').click()
    cy.get('button.save-property').click()
    clickAddField()
    cy.get('input.property-name').type('{selectall}Last name{enter}')

    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Bookings{enter}')
    cy.get('.edit-field-1').click()
    cy.get('input.property-name').type('{selectall}Customer')
    cy.get('select.property-type').select('Link to another record')
    cy.get('select.referenced-model').select('Customers')
    cy.get('input[name="cardinality"][value="one"]').click()
    cy.get('button.save-property').click()

    cy.contains('Configure view').click()
    cy.contains('First name').click()
    cy.contains('Last name').click()
    cy.get('button.save-view').click()
    cy.get('[data-cell-index="0-0"]').realPress('Enter')
    cy.get('select.reference-selector').select('Create a new Customers')
    cy.get('button.cancel').click()

    cy.get('[data-cell-index="0-0"]').click()
    cy.get('[data-cell-index="0-0"]').realPress('Enter')
    cy.get('select.reference-selector').select('Create a new Customers')
    cy.get('button.save').click()
    cy.get('[data-cell-index="0-0"]').should('contain', 'Required')
    cy.get('button.cancel').click()

    cy.get('[data-cell-index="0-0"]').click()
    cy.get('[data-cell-index="0-0"]').realPress('Enter')
    cy.get('select.reference-selector').select('Create a new Customers')
    cy.focused().should('have.attr', 'contenteditable', 'true')
    cy.focused().type('John').realPress('Tab')
    cy.focused().type('Smith').realPress('Tab')
    cy.get('button.save').click()
    cy.get('[data-cell-index="0-0"]').should('contain', 'John Smith')
  })
})
