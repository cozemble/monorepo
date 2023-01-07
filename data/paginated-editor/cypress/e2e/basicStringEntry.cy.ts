import { pageEditorLocalStorageKey } from '../../src/routes/paginatedEditor/context'
import { customerModel } from './customerModel'

describe('paginated editor', () => {
  beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(customerModel)))

  it('permits basic data entry by tabbing', () => {
    cy.visit('http://localhost:5173/paginatedEditor')
    cy.get('button.add-record').click()
    cy.get('td[data-cell-index="0-0"]').click({ force: true })
    cy.get('td[data-cell-index="0-0"]').trigger('keyup', { key: 'Enter' })
    cy.get('div.value-container').type('Mike')
    cy.get('div.value-container').trigger('keydown', { key: 'Tab' })
    cy.get('div.value-container').type('Smith')
    cy.get('div.value-container').trigger('keydown', { key: 'Tab' })
    cy.get('div.value-container').type('555-555-5555')
    cy.get('div.value-container').trigger('keydown', { key: 'Tab' })
    cy.get('div.value-container').type('mike.smith@gmail.com')
    cy.get('div.value-container').trigger('keydown', { key: 'Enter' })
  })
})
