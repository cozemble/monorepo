describe('model editor', () => {
  it('supports nested models', () => {
    cy.visit('http://localhost:5173/modelEditor')

    cy.contains('Add property').click()
    cy.get('.edit-property[data-property-name="Property 1"]').click()
    cy.contains('Required').click()
    cy.get('button.save-property').click()
    cy.get('button.edit-property').click()
    cy.get('input.required-toggle').should('be.checked')
  })
})
