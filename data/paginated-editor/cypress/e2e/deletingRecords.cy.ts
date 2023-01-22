import { pageEditorLocalStorageKey } from '../../src/routes/paginatedEditor/context'
import { allModels } from '../../src/routes/testModels'
import { enterData } from './helpers'

describe('paginated editor', () => {
  beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(allModels)))

  it('permits deleting of records', () => {
    cy.visit('http://localhost:5173/paginatedEditor')
    cy.get('button.add-record').click()

    enterData({
      invoiceID: '1234',
      'customer.firstName': 'Mike',
      'customer.lastName': 'Smith',
      'customer.phone': '555-555-555',
      'customer.email': 'smith@email.com',
      'customer.address.line1': '22 Main Street',
      'customer.address.postCode': '90210',
    })
    cy.get('button.save').click()
    cy.contains('Add Invoice').should('exist')
    cy.get('button.delete').click()
  })
})
