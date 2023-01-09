import { pageEditorLocalStorageKey } from '../../src/routes/paginatedEditor/context'
import { customerModel } from './customerModel'

describe('paginated editor', () => {
  beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(customerModel)))

  it('performs validation as configured by properties', () => {
    cy.visit('http://localhost:5173/paginatedEditor')
    cy.get('button.add-record').click()
    cy.get('button.save').click()

    cy.get('td[data-record-path="firstName"] .validation-errors').should('contain.text', 'Required')
    cy.get('td[data-record-path="firstName"] .value-container').type('Mike{enter}')
    cy.get('td[data-record-path="firstName"] .validation-errors').should('not.exist')
  })
})
