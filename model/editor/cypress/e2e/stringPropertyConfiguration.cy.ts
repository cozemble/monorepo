describe('model editor', () => {
  it('permits configuration of a string property', () => {
    cy.visit('http://localhost:5173/modelEditor')
    cy.get(".model-name").click()
    cy.get("input.model-name").type("{selectall}Customer{enter}")
    cy.contains("Add property").click()
    cy.get('.edit-property[data-property-name="Property 1"]').click()
    cy.get("input.property-name").type("{selectall}Phone{enter}")
    cy.get("input.required-toggle").click()
    cy.get("input.unique-toggle").click()
    cy.get("button.add-validation-button").click()
    cy.get("input.regex").type("^\\+?\\d{2}[- ]?\\d{3}[- ]?\\d{5}$")
    cy.get("input.message").type("Must be a valid phone number")
    cy.get("button.save-property").click()
  })

  it('permits addition of multiple properties', () => {
    cy.visit('http://localhost:5173/modelEditor')
    cy.get(".model-name").click()
    cy.get("input.model-name").type("{selectall}Customer{enter}")

    cy.contains("Add property").click()
    cy.get('.edit-property[data-property-name="Property 1"]').click()
    cy.get("input.property-name").type("{selectall}First name{enter}")
    cy.get("button.save-property").click()

    cy.contains("Add property").click()
    cy.get('.edit-property[data-property-name="Property 2"]').click()
    cy.get("input.property-name").type("{selectall}Last name{enter}")
    cy.get("button.save-property").click()
  })
})