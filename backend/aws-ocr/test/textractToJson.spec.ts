import { expect, test } from 'vitest'
import * as fs from 'fs'
import { GetDocumentAnalysisCommandOutput } from '@aws-sdk/client-textract'
import { Line, Table, textractToJson } from '../src/textractToJson'

test('real example', () => {
  const loaded: GetDocumentAnalysisCommandOutput = JSON.parse(
    fs.readFileSync(`${__dirname}/green-delivery-note.json`, 'utf8'),
  )
  const processed = textractToJson(loaded)
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
