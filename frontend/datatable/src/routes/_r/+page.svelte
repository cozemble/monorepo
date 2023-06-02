<script lang="ts">
  import { onMount } from 'svelte'
  import { writable, type Writable } from 'svelte/store'

  // Cozemble
  import type { ModelView } from '@cozemble/model-core'
  import { systemConfigurationFns } from '@cozemble/model-core'
  import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
  import { registerEverything } from '@cozemble/model-assembled'
  import {
    dataRecordFns,
    modelFns,
    modelOptions,
    propertyFns,
    propertyOptions,
  } from '@cozemble/model-api'

  import { makeInMemoryBackend } from '../../lib/backend/InMemoryBackend'
  import { backendFns } from '../../lib/appBackend'
  import Editor from '../../lib/components/editor/Editor.svelte'
  import { eventSourcedModelStore } from '../../lib'
  import DevOptions from '../DevOptions.svelte'

  //  dev options
  const permitModelling = writable(true)
  const showDevConsole = writable(false)

  // create a system configuration
  const systemConfiguration = systemConfigurationFns.empty()

  // models
  let customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withProperties(
      propertyFns.newInstance('First name', propertyOptions.required),
      propertyFns.newInstance('Last name'),
    ),
  )

  // const invoiceModelId = modelIdFns.newInstance('invoices')
  // let invoice = modelFns.newInstance("Invoice",modelOptions.withId(invoiceModelId), modelOptions.withProperties(propertyFns.newInstance("Invoice number", propertyOptions.required)), modelOptions.withSlot(modelReferenceFns.forwardModelReference(invoiceModelId,customer, modelReferenceIdFns.newInstance(), "one")))
  // const modelViews = writable([modelViewFns.newInstance("Summary View", customer.id, summaryViewFns.withHtmlTemplate('{{First name}} {{Last name}}'))] as ModelView[])

  const models = [customerModel]
  const modelViews: Writable<ModelView[]> = writable([])

  // create event sourced models from the models
  const eventSourcedModels = models.map((m) => eventSourcedModelFns.newInstance(m))

  backendFns.setBackend(makeInMemoryBackend(eventSourcedModels))

  // register everything for Cozemble packages
  onMount(() => {
    registerEverything()

    const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customerModel, {
      'First name': 'Mike',
      'Last name': 'Hogan',
    })

    const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customerModel, {
      'First name': 'Cherise',
      'Last name': 'Hogan',
    })

    backendFns.setBackend(
      makeInMemoryBackend(eventSourcedModels, [customerRecord1, customerRecord2]),
    )
  })
</script>

<DevOptions {permitModelling} {showDevConsole} />

<Editor
  models={eventSourcedModelStore(eventSourcedModels)}
  {modelViews}
  {systemConfiguration}
  userId="test"
  navbarState={writable(customerModel.id.value)}
  {showDevConsole}
  {permitModelling}
/>
