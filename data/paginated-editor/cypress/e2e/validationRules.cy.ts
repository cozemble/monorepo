import { pageEditorLocalStorageKey } from '../../src/routes/paginatedEditor/context'
import { allModels } from '../../src/routes/testModels'

describe('paginated editor', () => {
  beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(allModels)))

  it('performs validation as configured by properties', () => {
    cy.visit('http://localhost:5173/paginatedEditor')
    cy.get('button.add-record').click()
    cy.get('button.save').click()

    cy.get('td[data-record-path="invoiceID"] .validation-errors').should('contain.text', 'Required')
    cy.get('td[data-record-path="invoiceID"] .value-container').type('Invoice 22{enter}')
    cy.get('td[data-record-path="invoiceID"] .validation-errors').should('not.exist')
  })
})
