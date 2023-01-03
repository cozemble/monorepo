describe('model editor', () => {

  it('supports nested models', () => {
    cy.visit('http://localhost:5173/modelEditor')
    cy.get(".model-name").click()
    cy.get("input.model-name").type("{selectall}Delivery{enter}")

    cy.contains("Add property").click()
    cy.get('.edit-property[data-property-name="Property #1"]').click()
    cy.get("input.property-name").type("{selectall}Delivery ID{enter}")
    cy.get("button.save-property").click()

    cy.get('div[data-model-name="Delivery"] .add-nested-model').click()
    cy.get('select.cardinality').select("Many")
    cy.get('input.model-name').type("Product")
    cy.get('input.model-name-as-plural').type("Products")
    cy.contains("Every Delivery has zero, one or more Products of type Product").should('exist')
    cy.get("button.save").click()

    cy.get('div[data-model-name="Product"] .add-property').click()
    cy.get('.edit-property[data-property-name="Property #1"]').click()
    cy.get("input.property-name").type("{selectall}Product ID{enter}")
    cy.get("button.save-property").click()

    cy.get('div[data-model-name="Product"] .add-nested-model').click()
    cy.get('select.cardinality').select("Many")
    cy.get('input.model-name').type("Batch")
    cy.get('input.model-name-as-plural').type("Batches")
    cy.contains("Every Product has zero, one or more Batches of type Batch").should('exist')
    cy.get("button.save").click()

    cy.get('div[data-model-name="Batch"] .add-property').click()
    cy.get('.edit-property[data-property-name="Property #1"]').click()
    cy.get("input.property-name").type("{selectall}Batch ID{enter}")
    cy.get("button.save-property").click()

    cy.get('div[data-model-name="Delivery"] .add-nested-model').click()
    cy.get('select.cardinality').select("One")
    cy.get('input.model-name').type("Summary")
    cy.contains("Every Delivery has one Summary").should('exist')
    cy.get("button.save").click()

    cy.get('div[data-model-name="Summary"] .add-property').click()
    cy.get('.edit-property[data-property-name="Property #1"]').click()
    cy.get("input.property-name").type("{selectall}Description{enter}")
    cy.get("button.save-property").click()
  })
})