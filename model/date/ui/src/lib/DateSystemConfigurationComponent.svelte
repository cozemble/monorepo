<script lang="ts">
    import type {SystemConfiguration} from "@cozemble/model-core";
    import {datePropertyType} from "@cozemble/model-date-core";
    import type {Writable} from "svelte/store";

    export let systemConfiguration: Writable<SystemConfiguration>
</script>
<label>Date format:</label>
<input type="text" class="input input-bordered w-full max-w-xs"
       bind:value={$systemConfiguration.slotConfiguration[datePropertyType.value].configuration.dateFormat}/>