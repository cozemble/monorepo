describe('model editor', () => {
  it('permits change of the model name', () => {
    cy.visit('http://localhost:5173/modelEditor')
    cy.get('div.model-name').click()
    cy.get('input.model-name').type('{selectall}Customer{enter}')
    cy.get('div.model-name').should('contain.text', 'Customer')
  })
})
