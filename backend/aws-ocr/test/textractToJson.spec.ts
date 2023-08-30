import { expect, test } from 'vitest'
import * as fs from 'fs'
import { Block, GetDocumentAnalysisCommandOutput } from '@aws-sdk/client-textract'
import { textractToJson } from '../src/textractToJson'
import { Line, Table } from '@cozemble/backend-aws-ocr-types'

test('real example', () => {
  const loaded: GetDocumentAnalysisCommandOutput = JSON.parse(
    fs.readFileSync(`${__dirname}/green-delivery-note.json`, 'utf8'),
  )
  const processed = textractToJson(loaded.Blocks ?? [])
  expect(processed.pages).toHaveLength(1)
  const firstLine = processed.pages[0].items[0] as Line
  expect(firstLine.text).toEqual('DELIVERY #')
  const secondLine = processed.pages[0].items[1] as Line
  expect(secondLine.text).toEqual('US-004')

  const [firstTable, secondTable] = processed.pages[0].items.filter((i) => i._type === 'table') as [
    Table,
    Table,
  ]
  expect(firstTable.rows).toHaveLength(5)
  expect(firstTable.rows[0].cells).toEqual(['DELIVER TO', 'SHIP TO', 'Royal Milling Inc.'])
  expect(firstTable.rows[1].cells).toEqual([
    'Veruca Organic Nuts',
    'Veruca Organic Nuts',
    '201 East Street',
  ])
  expect(secondTable.rows).toHaveLength(6)
  expect(secondTable.rows[0].cells).toEqual(['QTY', 'DESCRIPTION', 'UNIT PRICE', 'AMOUNT'])
  expect(secondTable.rows[1].cells).toEqual([
    '1',
    "Queen's coronation mince pie",
    '105.00',
    '105.00',
  ])
})

test('waste collection invoice example', () => {
  const blocks: Block[] = JSON.parse(
    fs.readFileSync(`${__dirname}/waste-collection-invoice-textract-blocks.json`, 'utf8'),
  )
  const processed = textractToJson(blocks)
  expect(processed.pages).toHaveLength(3)
  const [firstTable, secondTable] = processed.pages[0].items.filter(
    (i) => i._type === 'table',
  ) as Table[]
  expect(firstTable).toBeDefined()
  expect(secondTable).toBeDefined()
  const firstContentRow = secondTable.rows[2]
  const description = firstContentRow.cells[2]
  expect(description).toEqual('Waste Collection\nGeneral Waste\n1100 litre wheelie bin')
})
