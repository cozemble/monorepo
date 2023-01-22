export function enterData(param: { [key: string]: string }) {
  Object.keys(param).forEach((key) => {
    const value = param[key]
    cy.get(`td[data-record-path="${key}"]`).click()
    cy.get(`td[data-record-path="${key}"]`).should('exist')
    cy.get(`td[data-record-path="${key}"]  .value-container`).should('exist')
    cy.get(`td[data-record-path="${key}"] .value-container`).type(`${value}{enter}`)
  })
}
