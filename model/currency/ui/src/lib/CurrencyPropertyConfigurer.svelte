<script lang="ts">
    import type {Model, SystemConfiguration} from "@cozemble/model-core";
    import { type CurrencyProperty, currencyModelChangedModelEvent } from "@cozemble/model-currency-core";
    import { createEventDispatcher } from "svelte"
    import type { Writable } from "svelte/store"

    export let model: Model
    export let property: CurrencyProperty
    export let systemConfiguration: Writable<SystemConfiguration>
        
    const dispatch = createEventDispatcher()

    function handleCurrencyChanged(event: Event) {
        const target = event.target as HTMLInputElement
        dispatch('modelChanged', currencyModelChangedModelEvent(
            model.id, 
            property.id, 
            target.value, 
            property.locale, null))
    }

    function handleLocalChanged(event: Event) {
        const target = event.target as HTMLInputElement
        dispatch('modelChanged', currencyModelChangedModelEvent(
            model.id, 
            property.id, 
            property.currency, 
            target.value, null)) // property.format
    }

    let currencyObj = [
        {key: "USD", value: "US Dollar (USD)"},
        {key: "EUR", value: "Euro (EUR)"},
        {key: "GBP", value: "British Pound (GBP)"},
        {key: "INR", value: "Indian Rupee (INR)"},
        {key: "AUD", value: "Australian Dollar (AUD)"},
        {key: "CAD", value: "Canadian Dollar (CAD)"},
        {key: "SGD", value: "Singapore Dollar (SGD)"},
        {key: "CHF", value: "Swiss Franc (CHF)"},
        {key: "MYR", value: "Malaysian Ringgit (MYR)"},
        {key: "JPY", value: "Japanese Yen (JPY)"},
        {key: "CNY", value: "Chinese Yuan Renminbi (CNY)"},
        {key: "NZD", value: "New Zealand Dollar (NZD)"},
        {key: "THB", value: "Thai Baht (THB)"},
        {key: "HUF", value: "Hungarian Forint (HUF)"},
        {key: "AED", value: "Emirati Dirham (AED)"}
    ]

    let localeObj = [
        {key: "en-US", value: "English (United States)"},
        {key: "es-US", value: "Spanish (United States)"},
        {key: "en-GB", value: "English (United Kingdom)"},
        {key: "es-ES", value: "Spanish (Spain)"},
        {key: "de-DE", value: "German (Germany)"},
        {key: "fr-FR", value: "French (France)"},
        {key: "zh-CN", value: "Chinese (Simplified)"},
        {key: "ru-RU", value: "Russian (Russia)"},
        {key: "bn-IN", value: "Bengali (India)"},
        {key: "da-DK", value: "Danish (Denmark)"}        
    ]

    let formatObj = [
        {key: "¤#,##0.00", value: "¤#,##0.00"},
        {key: "¤#,##0.00 ¤¤", value: "¤#,##0.00 ¤¤"},
        {key: "¤#,##0.00 ¤¤¤", value: "¤#,##0.00 ¤¤¤"},
        {key: "¤###0.00", value: "¤###0.00"},
        {key: "#,##0.00", value: "#,##0.00"},
        {key: "###0.00", value: "###0.00"}        
    ]

</script>

<div class="mt-3">
    <!-- currency -->
    <label class="label" for="currency-selector">Currency Type</label>  
    <select data-choose-data id="currency-selector" class="select select-bordered" 
        bind:value={property.currency} on:change={handleCurrencyChanged}>
        <option disabled selected>Select Currency</option>
        {#each currencyObj as c}
            <option value={c.key}>{c.value}</option>
        {/each}
    </select>   

    <!-- locale -->
    <label class="label" for="currency-locale-selector">Currency Locale</label>
    <select data-choose-data id="currency-locale-selector" class="select select-bordered" 
        bind:value={property.locale} on:change={handleLocalChanged}>
        <option disabled selected>Select Locale</option>
        {#each localeObj as l}
            <option value={l.key}>{l.value}</option>
        {/each}
    </select>

    <!-- format
    <label class="label" for="currency-format-selector">Currency Format</label>
    <select data-choose-data id="currency-locale-selector" class="property-type input input-bordered">
        <option disabled selected>Select Format</option>
        {#each formatObj as f}
            <option value={f.key}>{f.value}</option>
        {/each}
    </select>
    -->
</div>