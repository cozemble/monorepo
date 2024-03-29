<script lang="ts">
  import { derived } from 'svelte/store'

  // Cozemble
  import type { DataRecordId } from '@cozemble/model-core'
  import { modelFns } from '@cozemble/model-api'

  // common
  import { makeCombinedDataRecordEditorClient } from './makeCombinedDataRecordEditorClient'
  import { backend } from '../appBackend'
  import { modelRecordsContextFns } from './modelRecordsContextFns'
  import { singleRecordEditContext } from './contextHelper'
  // stores
  import { systemConfiguration } from '../stores/systemConfiguration'
  import { allModels } from '../stores/allModels'
  import { allModelViews } from '../stores/allModelViews'

  //

  export let recordId: DataRecordId
  export let rowIndex: number

  const records = modelRecordsContextFns.getRecords()
  const errorVisibilityByRecordId = modelRecordsContextFns.getErrorVisibilityByRecordId()

  //

  const maybeExistingEditor = singleRecordEditContext.optionalRecordEditorClient()

  if (!maybeExistingEditor) {
    const eventSourcedRecords = modelRecordsContextFns.getEventSourcedRecordGraph()
    const modelViewsProvider = () => $allModelViews
    const modelsProvider = () => $allModels
    const combinedClient = makeCombinedDataRecordEditorClient(
      backend,
      () => $systemConfiguration,
      modelsProvider,
      modelViewsProvider,
      eventSourcedRecords,
      modelRecordsContextFns.getFocusControls(),
      recordId,
    )
    singleRecordEditContext.setCombinedClient(combinedClient)
  }

  //

  let rootRecordIndex = singleRecordEditContext.optionalRootRecordIndex()

  if (rootRecordIndex === null) {
    rootRecordIndex = rowIndex
    singleRecordEditContext.setRootRecordIndex(rootRecordIndex)
    singleRecordEditContext.setRootRecordId(recordId)
  }

  //

  let maybeExistingErrorsForRecord = singleRecordEditContext.optionalErrorsForRecord()

  if (!maybeExistingErrorsForRecord) {
    const errors = derived(
      [records, allModels, systemConfiguration],
      ([records, models, systemConfiguration]) => {
        const maybeRecord = records.find((r) => r.id.value === recordId.value)

        if (maybeRecord) return modelFns.validate(systemConfiguration, models, maybeRecord)

        return new Map()
      },
    )
    singleRecordEditContext.setErrorsForRecord(errors)
  }

  //
  const maybeExistingErrorVisibility = singleRecordEditContext.optionalErrorVisibilityForRecord()

  if (!maybeExistingErrorVisibility) {
    const errorVisibility = derived(errorVisibilityByRecordId, (errorVisibilityByRecordId) => {
      return errorVisibilityByRecordId.get(recordId.value) ?? false
    })
    singleRecordEditContext.setErrorVisibilityForRecord(errorVisibility)
  }
</script>

<slot {rootRecordIndex} />
