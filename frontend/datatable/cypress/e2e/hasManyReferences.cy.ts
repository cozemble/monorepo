import {
  storeEdges,
  storeModels,
  storeModelViews,
  storeRecords,
} from '../../src/routes/cypress/testModels'
import { registerStringProperty } from '@cozemble/model-string-core'
import {
  modelIdFns,
  modelReferenceFns,
  ModelView,
  modelViewFns,
  summaryViewFns,
} from '@cozemble/model-core'
import { modelFns, modelOptions, propertyFns, propertyOptions } from '@cozemble/model-api'
import { timestampedRecordGraphEdgeFns } from '@cozemble/model-event-sourced/dist/esm'
import {
  recordGraphEdgeFns,
  systemConfigurationFns,
  tinyValueFns,
} from '@cozemble/model-core/dist/esm'
import { dataRecordFns } from '@cozemble/model-api/dist/esm'
import { cellSelector, editCell, expectText } from './helpers'

function makeFixtureData() {
  let customerModel = modelFns.newInstance(
    'Customers',
    modelOptions.withProperties(
      propertyFns.newInstance('First name', propertyOptions.required),
      propertyFns.newInstance('Last name'),
    ),
    modelOptions.withSingularName('Customer'),
  )
  customerModel.id.value = 'customers'
  const invoiceModelId = modelIdFns.newInstance('invoices')

  const invoiceToCustomerReference = modelReferenceFns.setOriginCardinality(
    modelReferenceFns.newInstance(invoiceModelId, [customerModel.id], 'Customer'),
    'one',
  )
  const customerToInvoicesReference = modelReferenceFns.inverse(
    invoiceToCustomerReference,
    'Invoices',
  )
  const invoiceModel = modelFns.newInstance(
    'Invoices',
    modelOptions.withId(invoiceModelId),
    modelOptions.withProperty(propertyFns.newInstance('Invoice ID', propertyOptions.required)),
    modelOptions.withSlot(invoiceToCustomerReference),
    modelOptions.withSingularName('Invoice'),
  )
  customerModel = modelFns.applyOptions(
    customerModel,
    modelOptions.withSlot(customerToInvoicesReference),
  )
  let modelViews = [] as ModelView[]

  modelViews = [
    ...modelViews,
    modelViewFns.newInstance(
      'Summary View',
      customerModel.id,
      summaryViewFns.withHtmlTemplate('{{First name}} {{Last name}}'),
    ),
  ]
  modelViews = [
    ...modelViews,
    modelViewFns.newInstance(
      'Summary View',
      invoiceModel.id,
      summaryViewFns.withHtmlTemplate('{{Invoice ID}}'),
    ),
  ]

  const models = [customerModel, invoiceModel]
  const systemConfiguration = systemConfigurationFns.empty()

  const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customerModel, {
    'First name': 'John',
    'Last name': 'Smith',
  })
  customerRecord1.id.value = 'customer1'
  const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customerModel, {
    'First name': 'Jane',
    'Last name': 'Doe',
  })

  const invoiceRecord11 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
    'Invoice ID': 'Invoice #11',
  })
  const invoiceRecord12 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
    'Invoice ID': 'Invoice #12',
  })
  const invoiceRecord13 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
    'Invoice ID': 'Invoice #13',
  })
  const invoiceRecord14 = dataRecordFns.random(systemConfiguration, models, invoiceModel, {
    'Invoice ID': 'Invoice #14',
  })
  customerRecord1.id.value = 'johnSmith'
  customerRecord2.id.value = 'janeDoe'
  invoiceRecord11.id.value = 'invoice11'
  invoiceRecord12.id.value = 'invoice12'
  invoiceRecord13.id.value = 'invoice13'
  invoiceRecord14.id.value = 'invoice14'
  const customer1ToBooking1Edge = timestampedRecordGraphEdgeFns.newInstance(
    recordGraphEdgeFns.newInstance(
      customerToInvoicesReference.id,
      invoiceModel.id,
      customerModel.id,
      invoiceRecord11.id,
      customerRecord1.id,
      tinyValueFns.id('originallyCustomer1ToInvoice11'),
    ),
  )
  const customer1ToBooking2Edge = timestampedRecordGraphEdgeFns.newInstance(
    recordGraphEdgeFns.newInstance(
      customerToInvoicesReference.id,
      invoiceModel.id,
      customerModel.id,
      invoiceRecord12.id,
      customerRecord1.id,
      tinyValueFns.id('originallyCustomer1ToInvoice12'),
    ),
  )
  const customer1ToBooking3Edge = timestampedRecordGraphEdgeFns.newInstance(
    recordGraphEdgeFns.newInstance(
      customerToInvoicesReference.id,
      invoiceModel.id,
      customerModel.id,
      invoiceRecord13.id,
      customerRecord2.id,
      tinyValueFns.id('originallyCustomer2ToBooking13'),
    ),
  )

  return {
    models,
    modelViews,
    records: [
      customerRecord1,
      customerRecord2,
      invoiceRecord11,
      invoiceRecord12,
      invoiceRecord13,
      invoiceRecord14,
    ],
    edges: [customer1ToBooking1Edge, customer1ToBooking2Edge, customer1ToBooking3Edge],
  }
}

describe('with one customer having two invoices and another customer having one invoice', () => {
  beforeEach(() => {
    registerStringProperty()
    const { models, modelViews, records, edges } = makeFixtureData()
    storeModels(models)
    storeRecords(records)
    storeModelViews(modelViews)
    storeEdges(edges)
  })

  it('the referenced records are displayed correctly', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customers').click()
    cy.get(cellSelector('0-2')).should('contain', 'Invoice #11')
    cy.get(cellSelector('0-2')).should('contain', 'Invoice #12')
    expectText(cellSelector('0-2'), 'Invoice #11 Invoice #12')
    cy.get(cellSelector('1-2')).should('contain', 'Invoice #13')
    cy.contains('Invoices').click()

    cy.get(cellSelector('0-0')).should('contain', 'Invoice #11')
    cy.get(cellSelector('0-1')).should('contain', 'John Smith')

    cy.get(cellSelector('1-0')).should('contain', 'Invoice #12')
    cy.get(cellSelector('1-1')).should('contain', 'John Smith')

    cy.get(cellSelector('2-0')).should('contain', 'Invoice #13')
    cy.get(cellSelector('2-1')).should('contain', 'Jane Doe')
  })

  it('can remove one record from the customer with two', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customers').click()
    editCell('0-2')
    cy.get('button.remove-reference-0').click()
    cy.get('button.save-references').click()
    cy.get('.existing-references').should('not.exist')
    expectText(cellSelector('0-2'), 'Invoice #12')
    cy.get('button.save-root-record').click()
    expectText(cellSelector('0-2'), 'Invoice #12')
  })

  it('can move an invoice from the customer with two to the customer with one', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customers').click()
    editCell('1-2')
    cy.get('select.reference-selector').select('Invoice #11')
    cy.get('button.save-references').click()
    expectText(cellSelector('0-2'), 'Invoice #12')
    expectText(cellSelector('1-2'), 'Invoice #13 Invoice #11')
  })

  it('can add an existing invoice to the customer with one', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customers').click()
    editCell('1-2')
    cy.get('select.reference-selector').select('Invoice #14')
    cy.get('button.save-references').click()
    expectText(cellSelector('0-2'), 'Invoice #11 Invoice #12')
    expectText(cellSelector('1-2'), 'Invoice #13 Invoice #14')
    cy.get('button.save-root-record').click()
    expectText(cellSelector('0-2'), 'Invoice #11 Invoice #12')
    expectText(cellSelector('1-2'), 'Invoice #13 Invoice #14')
  })

  it('can add a new invoice to the customer with one', () => {
    cy.visit('http://localhost:5173/cypress')
    cy.contains('Customers').click()
    editCell('1-2')
    cy.get('select.reference-selector').select('Create a new Invoice')
    cy.focused().should('have.attr', 'contenteditable', 'true')
    cy.focused().type('Invoice #15').realPress('Enter')
    cy.get(cellSelector('0-1')).should('contain', 'Jane Doe')
    cy.get('button.save').click()

    cy.get('select.reference-selector').select('Create a new Invoice')
    cy.focused().should('have.attr', 'contenteditable', 'true')
    cy.focused().type('Invoice #16').realPress('Enter')
    cy.get(cellSelector('0-1')).should('contain', 'Jane Doe')
    cy.get('button.save').click()

    cy.get('button.save-references').click()
    expectText(cellSelector('1-2'), 'Invoice #13 Invoice #15 Invoice #16')
    cy.get('button.save-root-record').click()
    expectText(cellSelector('0-2'), 'Invoice #11 Invoice #12')
    expectText(cellSelector('1-2'), 'Invoice #13 Invoice #15 Invoice #16')
  })
})
