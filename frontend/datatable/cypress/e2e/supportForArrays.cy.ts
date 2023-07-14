import { cellSelector, editCell } from './helpers'

describe('data table', () => {
  it('supports array property types', () => {
    cy.visit('http://localhost:5173/empty')
    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Customers{enter}')
    cy.get('.edit-field-1').click()
    cy.get('select.property-type').select('List of...')
    cy.get('select.itemType').select('Email')
    cy.get('button.save-property').click()
    cy.get(`[data-cell-index="0-0"]`).invoke('text').should('have.length', 1)

    editCell('0-0')
    cy.get('button.add-item').click()

    cy.get(cellSelector('0-0')).should('contain', 'Must be a valid email address')
    cy.focused().type('mike@email.com').realPress('Tab')
    cy.get(cellSelector('0-0')).should('not.contain', 'Must be a valid email address')
    cy.get('button.save-item').click()
    cy.get('button.save-root-record').click()
    editCell('0-0')
    cy.get('button.delete-item').click()
    cy.get('button.save-item').click()
    cy.get('button.save-root-record').click()
    cy.get(`[data-cell-index="0-0"]`).invoke('text').should('have.length', 1)
  })
})
