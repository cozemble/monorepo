export function clickAddField(eq = 0) {
  cy.get('.dropdown.add-model-element').eq(eq).click()
  cy.get('a.add-field').eq(eq).click()
}

export function clickAddSubtable() {
  cy.get('.dropdown.add-model-element').click()
  cy.get('a.add-sub-table').click()
}

export function clickAddSubrecord() {
  cy.get('.dropdown.add-model-element').click()
  cy.get('a.add-sub-record').click()
}

export function editCell(cellIndex = '0-0', eq = 0) {
  const selector = cellSelector(cellIndex)
  cy.get(selector).eq(eq).click()
  cy.get(selector).eq(eq).should('have.class', 'focused')
  cy.get(selector).eq(eq).dblclick()
}

export function cellSelector(cellIndex = '0-0') {
  return `[data-cell-index="${cellIndex}"]`
}

export function clickTable(index: number) {
  cy.get('a.model-' + index).click()
}

export function expectText(selector: string, expected: string) {
  cy.get(selector)
    .invoke('text')
    .then((text) => {
      assert.equal(text.trim(), expected)
    })
}
