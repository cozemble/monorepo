<script lang="ts">
    import {modelFns, modelOptions, nestedModelFns, propertyFns, propertyOptions} from "@cozemble/model-api";
    import {modelViewFns, summaryViewFns} from "@cozemble/model-core";
    import ModelViewEditor from "../lib/ModelViewEditor.svelte";
    import {writable} from "svelte/store";
    import {afterUpdate} from "svelte";

    const addressModel = modelFns.newInstance("Address", modelOptions.withProperties(propertyFns.newInstance("Street"), propertyFns.newInstance("City"), propertyFns.newInstance("Postcode")))
    const nestedDeliveryAddress = nestedModelFns.newInstance("Delivery Address", addressModel.id, "one")

    let customer = modelFns.newInstance("Customer", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")), modelOptions.withNestedModels(nestedDeliveryAddress))
    addressModel.parentModelId = addressModel.id
    const models = [customer, addressModel]
    const modelView = writable(modelViewFns.newInstance("Empty Model View", customer.id, summaryViewFns.empty()))
    afterUpdate(() => {
        console.log($modelView)
    })
</script>
<div class="m-2">
    <ModelViewEditor {modelView} {models}/>
</div>
