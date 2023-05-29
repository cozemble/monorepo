<script lang="ts">
    import type {Model, SystemConfiguration} from "@cozemble/model-core";
    import type {CurrencyProperty} from "@cozemble/model-currency-core";
    import { createEventDispatcher } from "svelte"
    import { currencyPropertyType } from "@cozemble/model-currency-core"
import type { Writable } from "svelte/store"

    export let model: Model
    export let property: CurrencyProperty
    export let systemConfiguration: Writable<SystemConfiguration>
        
    const dispatch = createEventDispatcher()

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
        {key: "en_US", value: "English (United States)"},
        {key: "es_US", value: "Spanish (United States)"},
        {key: "en_GB", value: "English (United Kingdom)"},
        {key: "es_ES", value: "Spanish (Spain)"},
        {key: "de_DE", value: "German (Germany)"},
        {key: "fr_FR", value: "French (France)"},
        {key: "zh_CN", value: "Chinese (Simplified)"},
        {key: "ru_RU", value: "Russian (Russia)"},
        {key: "bn_IN", value: "Bengali (India)"},
        {key: "da_DK", value: "Danish (Denmark)"}        
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
    <select data-choose-data id="currency-selector" class="select select-bordered">
        <option disabled selected>Select Currency</option>
        {#each currencyObj as c}
            <option value={c.key}>{c.value}</option>
        {/each}
    </select>   

    <!-- locale -->
    <label class="label" for="currency-locale-selector">Currency Locale</label>
    <select data-choose-data id="currency-locale-selector" class="select select-bordered">
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