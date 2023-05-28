import { cellSelector, clickAddField, clickTable, editCell } from './helpers'

function setTableSingularName(tableIndex: number, singularName: string) {
  cy.get(`.edit-model-${tableIndex}`).click()
  cy.get('input.singular').type('{selectall}' + singularName + '{enter}')
}

describe('data table', () => {
  it('supports building model references from the many side e.g. from customer to bookings', () => {
    cy.visit('http://localhost:5173/empty')
    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Customers{enter}')
    cy.get('.edit-field-1').click()
    cy.get('input.property-name').type('{selectall}First name')
    cy.get('button.save-property').click()
    clickAddField()
    cy.get('input.property-name').type('{selectall}Last name{enter}')

    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Bookings{enter}')
    cy.get('.edit-field-1').click()
    cy.get('input.property-name').type('{selectall}Booking number{enter}')

    clickTable(1)
    clickAddField()
    cy.get('input.property-name').type('{selectall}Bookings')
    cy.get('select.property-type').select('Link to another record')
    cy.get('select.referenced-model').select('Bookings')
    cy.get('button.save-property').click()

    cy.contains('Configure view').click()
    cy.contains('Booking number').click()
    cy.get('button.save-view').click()

    setTableSingularName(1, 'Customer')
    setTableSingularName(2, 'Booking')

    editCell('0-0')
    cy.focused().type('John').realPress('Tab')
    cy.focused().type('Smith').realPress('Tab')
    cy.get('select.reference-selector').select('Create a new Booking')
    cy.focused().should('have.attr', 'contenteditable', 'true')
    cy.focused().type('Booking #11').realPress('Tab')
    cy.contains('Configure view').click()
    cy.contains('First name').click()
    cy.contains('Last name').click()
    cy.get('button.save-view').click()
    cy.get(cellSelector('0-1')).should('contain', 'John Smith')
    cy.get('button.save').click()
    cy.get('button.save-root-record').click()

    cy.get(cellSelector('0-2')).should('contain', 'Booking #11')

    clickTable(2)
    cy.get(cellSelector('0-0')).should('contain', 'Booking #11')
    cy.get(cellSelector('0-1')).should('contain', 'John Smith')

    cy.get('.edit-field-2').click()
    cy.get('select.referenced-model').find(':selected').should('have.text', 'Customer')
    cy.contains('Cancel').click()
  })
})
