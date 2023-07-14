import { test, expect } from 'vitest'
import { extractTerms } from '../src/index.js'

test('deals with empty strings', () => {
  expect(extractTerms('', '{', '}')).toHaveLength(0)
})

test('deals with no matches', () => {
  expect(extractTerms('has no braces', '{', '}')).toHaveLength(0)
})

test('deals with empty terms', () => {
  expect(extractTerms('{} {}', '{', '}')).toMatchObject(['{}', '{}'])
})

test('leading closing delimiters are ignored', () => {
  expect(extractTerms('}{} {}', '{', '}')).toMatchObject(['{}', '{}'])
})

test('tailing opening delimiters are ignored', () => {
  expect(extractTerms('{} {}{', '{', '}')).toMatchObject(['{}', '{}'])
})

test('unbalanced ends are ignored', () => {
  expect(extractTerms('{} {} {{}', '{', '}')).toMatchObject(['{}', '{}'])
})

test('deals with nested empty terms', () => {
  expect(extractTerms('{{}} {{{}}}', '{', '}')).toMatchObject(['{{}}', '{{{}}}'])
})

test('deals with nested terms with content', () => {
  expect(extractTerms('{{a,b,c}} ignored , {{d,e:{f,g}}}', '{', '}')).toMatchObject([
    '{{a,b,c}}',
    '{{d,e:{f,g}}}',
  ])
})

test('deals with delimiters that are more than one character long', () => {
  expect(extractTerms('Delivery Docket: {{Delivery Docket}}', '{{', '}}')).toMatchObject([
    '{{Delivery Docket}}',
  ])
})

test('can deal with long strings', () => {
  const str =
    'mutation mutation($upsert0_0_data: jsonb!, $upsert0_0_references: jsonb!, $upsert1_0_data: jsonb!, $upsert1_0_references: jsonb!, $upsert2_0_data: jsonb!, $upsert2_0_references: jsonb!, $upsert3_0_latestState: jsonb!, $upsert3_0_change: jsonb!, $upsert4_0_data: jsonb!, $upsert4_0_references: jsonb!, $upsert5_0_data: jsonb!, $upsert5_0_references: jsonb!, $upsert6_0_latestState: jsonb!, $upsert6_0_change: jsonb!, $upsert7_0_data: jsonb!, $upsert7_0_references: jsonb!) {\n' +
    '  upsert0: insert_records(objects: [{recordId: "23ccc6a9-66b2-4d62-a3cd-23db01fa03c6", modelId: "plan_ade5bb41-Bbdf-458a-9632-46f4d3ad4c32", teamId: "thesmartwashltd.com", data: $upsert0_0_data, references: $upsert0_0_references, textification: "code_4c24c6b3-Cd0e-4dd6-81da-Ba469e48e4e2:m37jnd: name_c484bac2-488c-424b-Bea7-7a29e4f5dfd4:hig368: price_7754b097-C529-44f3-9fdb-60cd61a91c09:251742: daysBetweenBookings_2199dc27-C3af-4604-928d-D314f094dcbf:14:", dateSlot1: null, dateSlot2: null, dateSlot3: null, dateSlot4: null, dateSlot5: null, creatorId: null}], on_conflict: {constraint: records_pkey, update_columns: [modelId, data, references, textification, dateSlot1, dateSlot2, dateSlot3, dateSlot4, dateSlot5, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert1: insert_records(objects: [{recordId: "a00fbaeb-ed41-4e79-a5ab-c67e3be367a4", modelId: "plan_ade5bb41-Bbdf-458a-9632-46f4d3ad4c32", teamId: "thesmartwashltd.com", data: $upsert1_0_data, references: $upsert1_0_references, textification: "code_4c24c6b3-Cd0e-4dd6-81da-Ba469e48e4e2:s4zit: name_c484bac2-488c-424b-Bea7-7a29e4f5dfd4:gl4ax: price_7754b097-C529-44f3-9fdb-60cd61a91c09:572474: daysBetweenBookings_2199dc27-C3af-4604-928d-D314f094dcbf:28:", dateSlot1: null, dateSlot2: null, dateSlot3: null, dateSlot4: null, dateSlot5: null, creatorId: null}], on_conflict: {constraint: records_pkey, update_columns: [modelId, data, references, textification, dateSlot1, dateSlot2, dateSlot3, dateSlot4, dateSlot5, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert2: insert_records(objects: [{recordId: "295939ca-7b97-42f0-ae92-415e4031105a", modelId: "subscription_2fb0cc77-Aa87-4910-9bd9-Cf7c125a36f7", teamId: "thesmartwashltd.com", data: $upsert2_0_data, references: $upsert2_0_references, textification: "subscriptionID_6b0711f6-76f3-40dc-8a37-E07334895c1a:atg2xe: plan_4bbea53d-9e63-4339-845b-35e1acf63721.code_4c24c6b3-Cd0e-4dd6-81da-Ba469e48e4e2:m37jnd: plan_4bbea53d-9e63-4339-845b-35e1acf63721.name_c484bac2-488c-424b-Bea7-7a29e4f5dfd4:hig368: paid_e98b428f-7ba6-4d2f-A672-4bc2a6d94778:914407:", dateSlot1: "1970-01-01", dateSlot2: null, dateSlot3: null, dateSlot4: null, dateSlot5: null, creatorId: null}], on_conflict: {constraint: records_pkey, update_columns: [modelId, data, references, textification, dateSlot1, dateSlot2, dateSlot3, dateSlot4, dateSlot5, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert3: insert_record_state_changes(objects: [{id: "f21d7da7-8cc9-45ed-9a44-5124f239a2b2", teamId: "thesmartwashltd.com", recordId: "295939ca-7b97-42f0-ae92-415e4031105a", modelId: "subscription_2fb0cc77-Aa87-4910-9bd9-Cf7c125a36f7", stateFlowName: "main", latestState: $upsert3_0_latestState, change: $upsert3_0_change}], on_conflict: {constraint: record_state_changes_pkey, update_columns: [recordId, modelId, stateFlowName, latestState, change, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert4: insert_records(objects: [{recordId: "62639008-8583-43a3-9bec-95e24acea75a", modelId: "bookingWindow_2b8b2238-2a8a-4d06-8cc9-Da91c720d9ac", teamId: "thesmartwashltd.com", data: $upsert4_0_data, references: $upsert4_0_references, textification: "windowID_616559f8-5907-488c-94fd-E69c4391f8c9:8t1krp:", dateSlot1: "2022-06-16", dateSlot2: "2022-06-30", dateSlot3: null, dateSlot4: null, dateSlot5: null, creatorId: null}], on_conflict: {constraint: records_pkey, update_columns: [modelId, data, references, textification, dateSlot1, dateSlot2, dateSlot3, dateSlot4, dateSlot5, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert5: insert_records(objects: [{recordId: "f19a31ba-1a93-40d8-a4f4-02313d794eb2", modelId: "subscription_2fb0cc77-Aa87-4910-9bd9-Cf7c125a36f7", teamId: "thesmartwashltd.com", data: $upsert5_0_data, references: $upsert5_0_references, textification: "subscriptionID_6b0711f6-76f3-40dc-8a37-E07334895c1a:atqqu8i: plan_4bbea53d-9e63-4339-845b-35e1acf63721.code_4c24c6b3-Cd0e-4dd6-81da-Ba469e48e4e2:s4zit: plan_4bbea53d-9e63-4339-845b-35e1acf63721.name_c484bac2-488c-424b-Bea7-7a29e4f5dfd4:gl4ax: paid_e98b428f-7ba6-4d2f-A672-4bc2a6d94778:879819:", dateSlot1: "1970-01-01", dateSlot2: null, dateSlot3: null, dateSlot4: null, dateSlot5: null, creatorId: null}], on_conflict: {constraint: records_pkey, update_columns: [modelId, data, references, textification, dateSlot1, dateSlot2, dateSlot3, dateSlot4, dateSlot5, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert6: insert_record_state_changes(objects: [{id: "d01b2d48-47c9-474f-9cd8-aa02ae740465", teamId: "thesmartwashltd.com", recordId: "f19a31ba-1a93-40d8-a4f4-02313d794eb2", modelId: "subscription_2fb0cc77-Aa87-4910-9bd9-Cf7c125a36f7", stateFlowName: "main", latestState: $upsert6_0_latestState, change: $upsert6_0_change}], on_conflict: {constraint: record_state_changes_pkey, update_columns: [recordId, modelId, stateFlowName, latestState, change, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '  upsert7: insert_records(objects: [{recordId: "82f6948d-c01a-477c-95c3-77e590b91aa8", modelId: "bookingWindow_2b8b2238-2a8a-4d06-8cc9-Da91c720d9ac", teamId: "thesmartwashltd.com", data: $upsert7_0_data, references: $upsert7_0_references, textification: "windowID_616559f8-5907-488c-94fd-E69c4391f8c9:xe0f2:", dateSlot1: "2022-06-16", dateSlot2: "2022-06-30", dateSlot3: null, dateSlot4: null, dateSlot5: null, creatorId: null}], on_conflict: {constraint: records_pkey, update_columns: [modelId, data, references, textification, dateSlot1, dateSlot2, dateSlot3, dateSlot4, dateSlot5, updatedAt]}) {\n' +
    '    affected_rows\n' +
    '  }\n' +
    '}\n'
  const terms = extractTerms(str, '{', '}')
  expect(terms).toBeDefined()
})
