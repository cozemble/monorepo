<script lang="ts">
    import type {SystemConfiguration} from "@cozemble/model-core";
    import {datePropertyType} from "@cozemble/model-date-core";
    import type {Writable} from "svelte/store";

    export let systemConfiguration: Writable<SystemConfiguration>
    console.log({systemConfiguration})

    let dateFormatObj = [
        { key: "ddd MMM DD HH:mm:ss Z YYYY", value:"ddd MMM DD HH:mm:ss Z YYYY (Sun Jan 22 23:04:05 -0000 2006)"},
        { key: "MMMM DD YYYY HH:mm:ss", value: "MMMM DD YYYY HH:mm:ss (January 22 2006 23:04:05)" },
        { key: "MMMM DD YYYY", value:"MMMM DD YYYY (January 22 2006)" },
        { key: "YYYY-MM-DDTHH:mm:ssZ", value: "YYYY-MM-DDTHH:mm:ssZ (2006-01-22T23:04:05-0000)" },
        { key: "YYYY-MM-DD HH:mm:ss Z", value: "YYYY-MM-DD HH:mm:ss Z (2006-01-22 23:04:05 -0000)" },
        { key: "YYYY-MM-DD", value: "YYYY-MM-DD (2006-01-22)" },
        { key: "MM/DD/YYYY", value: "MM/DD/YYYY (01/22/2006)" },
        { key: "MM/DD/YY", value: "MM/DD/YY (01/22/06)" },
        { key: "DD-MM-YYYY", value: "DD-MM-YYYY (22-01-2006)" },
        { key: "DD/MM/YYYY", value: "DD/MM/YYYY (22/01/2006)" },
        { key: "DD/MM/YY", value: "DD/MM/YY (22/01/06)" },
        { key: "X", value: "X (1137971045)" }
    ]
  
</script>

<label class="label" for="date-format-selector">Date format selector</label>
<!-- Dropdown list date format types -->
<div class="mb-8" id="date-format-selector">
    <select data-choose-data class="select select-bordered select-primary w-full max-w-3xl text-xl" 
        bind:value={$systemConfiguration.slotConfiguration[datePropertyType.value].configuration.dateFormat}>
        <option disabled selected>Select default Date Format</option>
		{#each dateFormatObj as dateFormat}
			<option value={dateFormat.key}>{dateFormat.value}</option>
		{/each}
    </select>
</div>