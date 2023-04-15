import { pageEditorLocalStorageKey } from '../../src/routes/paginatedEditor/context'
import { allModels } from '../../src/routes/testModels'
import { enterData } from './helpers'

describe('paginated editor', () => {
  beforeEach(() => localStorage.setItem(pageEditorLocalStorageKey, JSON.stringify(allModels)))

  it('permits basic data entry', () => {
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
    cy.contains('Add Line Item').click()

    enterData({
      quantity: '1',
      name: 'Thing 1',
      price: '1.00',
    })

    cy.get('button.save-lineItem').click()
    cy.get('button.save-invoice').click()
    cy.contains('Add Invoice').should('exist')
  })
})
