<script lang="ts">
    import {
        dataRecordFns,
        modelFns,
        modelOptions,
        nestedModelFns,
        propertyFns,
        propertyOptions
    } from "@cozemble/model-api";
    import {modelViewFns, summaryViewFns, systemConfigurationFns} from "@cozemble/model-core";
    import {writable} from "svelte/store";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from "svelte";
    import ModelViewEditorWithPreview from "../lib/modelViewEditor/ModelViewEditorWithPreview.svelte";

    const addressModel = modelFns.newInstance("Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("Postcode")))
    const nestedDeliveryAddress = nestedModelFns.newInstance("Delivery Address", addressModel.id, "one")

    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")), modelOptions.withNestedModels(nestedDeliveryAddress))
    addressModel.parentModelId = addressModel.id
    const systemConfiguration = systemConfigurationFns.empty()
    const models = [customer, addressModel]
    const modelView = writable(modelViewFns.newInstance("Empty Model View", customer.id, summaryViewFns.empty()))
    let sampleRecords = []

    onMount(() => {
        registerEverything()
        const customerRecord1 = dataRecordFns.random(systemConfiguration, models, customer)
        const customerRecord2 = dataRecordFns.random(systemConfiguration, models, customer)
        sampleRecords = [customerRecord1, customerRecord2]
    })

</script>
<div class="m-2">
    <ModelViewEditorWithPreview {modelView} {models} {sampleRecords}/>
</div>
