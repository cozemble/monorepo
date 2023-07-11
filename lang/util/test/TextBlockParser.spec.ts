import { test, expect } from 'vitest'
import { TextBlockParser } from '../src/TextBlockParser.js'

const beginWhereClause = (line: string) => line.indexOf('where:') > -1
const endBlock = (line: string) => line.trim() === '}'
const beginBlock = (line: string) => line.trim().endsWith('{')

test('can parse out blocks of text', () => {
  const block = `query ListModelsAndSlotMappingsForTeam($teamId: String) {
                  models(where: {team_id: {_eq: $teamId}}) {
                    create_date
                    definition
                  }
                  model_slot_mapping(where: {team_id: {_eq: $teamId}}) {
                    definition
                    model_id
                    model_slot_mapping_id
                  }
                }`
  const para1 = `                  models(where: {team_id: {_eq: $teamId}}) {
                    create_date
                    definition
                  }`
  const para2 = `                  model_slot_mapping(where: {team_id: {_eq: $teamId}}) {
                    definition
                    model_id
                    model_slot_mapping_id
                  }`

  const parser = new TextBlockParser(beginWhereClause, endBlock, beginBlock, endBlock)
  const paras = parser.parse(block.split('\n'))
  expect(paras).toHaveLength(2)
  expect(paras[0]).toMatchObject(para1.split('\n'))
  expect(paras[1]).toMatchObject(para2.split('\n'))
})

test('nested paras are supported', () => {
  const textWithNestedParas = `subscription RowCountSubscription($modelId:String) {
              rows_aggregate(where: {modelId: {_eq: $modelId}}) {
                aggregate {
                  count
                }
              }
            }`
  const para1 = `              rows_aggregate(where: {modelId: {_eq: $modelId}}) {
                aggregate {
                  count
                }
              }`
  const parser = new TextBlockParser(beginWhereClause, endBlock, beginBlock, endBlock)

  const paras = parser.parse(textWithNestedParas.split('\n'))
  expect(paras).toHaveLength(1)
  expect(paras[0]).toMatchObject(para1.split('\n'))
})
