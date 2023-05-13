import {
  addressModel,
  customerModel,
  storeModels,
  storeRecords,
} from '../../src/routes/cypress/testModels'
import { registerStringProperty } from '@cozemble/model-string-core'
import { clickAddField, clickAddSubrecord, editCell } from './helpers'
import { dataRecordFns } from '@cozemble/model-api'
import { systemConfigurationFns } from '@cozemble/model-core'

function enterAddressFirstThenCustomer() {
  editCell('0-0', 1)
  cy.focused().type('11 Main Street').realPress('Tab')
  cy.focused().type('CM23 1AW').realPress('Tab')
  editCell('0-0')
  cy.focused().type('Jane').realPress('Tab')
  cy.focused().type('Smith').realPress('Enter')
  cy.get('button.save-root-record').click()
}

describe('with no existing records', () => {
  before(() => {
    registerStringProperty()
    storeModels([addressModel, customerModel])
  })
  it('can click on a nested model slot element to begin editing', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customer').click()
    cy.contains('Expand').click()
    enterAddressFirstThenCustomer()
  })
})

describe('with existing records', () => {
  before(() => {
    registerStringProperty()
    storeModels([addressModel, customerModel])
    storeRecords([
      dataRecordFns.random(
        systemConfigurationFns.empty(),
        [addressModel, customerModel],
        customerModel,
      ),
    ])
  })
  it('can click on a nested model slot element to begin editing', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customer').click()
    cy.get('button.expand-collapse').eq(1).click()
    editCell('0-0', 1)
    cy.focused().type('11 Main Street').realPress('Tab')
    cy.focused().type('CM23 1AW').realPress('Tab')
    editCell('1-0')
    cy.focused().type('Jane').realPress('Tab')
    cy.focused().type('Smith').realPress('Enter')
    cy.get('button.save-root-record').click()
  })
})

describe('when building a nested record', () => {
  it('can click on a nested model slot element to begin editing', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.get('.add-table-link').click()
    cy.get('.table-name').type('{selectall}Customers{enter}')
    cy.get('.edit-field-1').click()
    cy.get('input.property-name').type('{selectall}First name{enter}')
    clickAddField()
    cy.get('input.property-name').type('{selectall}Last name{enter}')

    clickAddSubrecord()
    cy.focused().type('{selectall}Address{enter}')

    cy.get('.edit-field-1').eq(1).click()
    cy.get('input.property-name').type('{selectall}Street')
    cy.get('button.save-property').click()

    clickAddField(1)
    cy.get('input.property-name').type('{selectall}Postcode')
    cy.get('button.save-property').click()

    enterAddressFirstThenCustomer()
  })
})
