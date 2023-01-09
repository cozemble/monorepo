import { pageEditorLocalStorageKey } from '../../src/routes/paginatedEditor/context'
import { customerModel } from './customerModel'

describe('paginated editor', () => {
  beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(customerModel)))

  it('permits basic data entry by tabbing', () => {
    cy.visit('http://localhost:5173/paginatedEditor')
    cy.get('button.add-record').click()

    cy.get('div.value-container').type('Mike')
    cy.get('div.value-container').trigger('keydown', { key: 'Tab' })

    cy.get('div.value-container').type('Smith')
    cy.get('div.value-container').trigger('keydown', { key: 'Tab' })

    cy.get('div.value-container').type('555-555-5555')
    cy.get('div.value-container').trigger('keydown', { key: 'Tab' })

    cy.get('div.value-container').type('mike.smith@gmail.com')
    cy.get('div.value-container').trigger('keydown', { key: 'Enter' })

    cy.get('button.save').click()

    cy.get('td[data-cell-index="0-0"]').should('contain.text', 'Mike')
    cy.get('td[data-cell-index="0-1"]').should('contain.text', 'Smith')
    cy.get('td[data-cell-index="0-2"]').should('contain.text', '555-555-5555')
    cy.get('td[data-cell-index="0-3"]').should('contain.text', 'mike.smith@gmail.com')

    cy.get('button.edit').click()

    cy.get('div.value-container').type('{selectall}Tom')
    cy.get('div.value-container').trigger('keydown', { key: 'Enter' })
    cy.get('button.save').click()

    cy.get('td[data-cell-index="0-0"]').should('contain.text', 'Tom')
    cy.get('td[data-cell-index="0-1"]').should('contain.text', 'Smith')
    cy.get('td[data-cell-index="0-2"]').should('contain.text', '555-555-5555')
    cy.get('td[data-cell-index="0-3"]').should('contain.text', 'mike.smith@gmail.com')

    // cy.get('td[data-record-path="firstName"]').click({ force: true })
    // cy.get('td[data-cell-index="0-0"]').trigger('keyup', { key: 'Enter' })
    // cy.get('div.value-container').type('Mike')
    // cy.get('div.value-container').trigger('keydown', { key: 'Tab' })
    // cy.get('div.value-container').type('Smith')
    // cy.get('div.value-container').trigger('keydown', { key: 'Tab' })
    // cy.get('div.value-container').type('555-555-5555')
    // cy.get('div.value-container').trigger('keydown', { key: 'Tab' })
    // cy.get('div.value-container').type('mike.smith@gmail.com')
    // cy.get('div.value-container').trigger('keydown', { key: 'Enter' })
  })
})
