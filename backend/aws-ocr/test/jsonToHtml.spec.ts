import { expect, test } from 'vitest'
import { textractToJson } from '../src/textractToJson'
import * as fs from 'fs'
import { GetDocumentAnalysisCommandOutput } from '@aws-sdk/client-textract'
import { jsonToHtml } from '../src/jsonToHtml'

test('real example', () => {
  const loaded: GetDocumentAnalysisCommandOutput = JSON.parse(
    fs.readFileSync(`${__dirname}/green-delivery-note.json`, 'utf8'),
  )
  const processed = jsonToHtml(textractToJson(loaded.Blocks ?? []))
  expect(processed.startsWith('<p>DELIVERY #</p><p>US-004</p>')).toBe(true)
})
