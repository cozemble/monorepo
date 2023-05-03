<script lang="ts">

    import Cog6ToothIcon from "../icons/Cog6ToothIcon.svelte";
    import SettingsPanel from "../settings/SettingsPanel.svelte";
    import DatabaseIcon from "../icons/DatabaseIcon.svelte";
    import UserInstructionNotices from "../notices/UserInstructionNotices.svelte";
    import ToastNotices from "../notices/ToastNotices.svelte";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from "svelte";
    import IncrementalModelingData from "./IncrementalModelingData.svelte";
    import {IncrementalModelingBackend} from "./IncrementalModelingBackend";
    import {backendFns} from "@cozemble/frontend-datatable";
    import {backend} from "../backend/backendStore";
    import {models} from "../models/modelsStore";

    export let tenantId: string
    let panelToShow: "data" | "settings" = "data"

    onMount(() => {
        registerEverything()
        backendFns.setBackend(new IncrementalModelingBackend(backend,tenantId, () => $models))
    })

</script>
<div class="drawer drawer-mobile">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle"/>
    <div class="drawer-content">
        <div class="floating-div bg-accent">
            <UserInstructionNotices/>
            <ToastNotices/>
        </div>
        <!-- Page content here -->
        <div class="tabs ml-2">
            <div>
                <div class="panel-container visible">
                    <div class="inner-panel-container">
                        {#if panelToShow === 'data'}
                            <IncrementalModelingData />
                        {:else if panelToShow === 'settings'}
                            <SettingsPanel {tenantId}/>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="drawer-side border">
        <label for="my-drawer-2" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 bg-base-100 text-base-content">
            <h2 class="mb-2">Cozemble</h2>
            <li on:click={() => panelToShow = 'data'} class:active-nav-item={panelToShow === 'data'}>
                <a>
                    <DatabaseIcon/>
                    Data</a></li>
            <li on:click={() => panelToShow = 'settings'} class:active-nav-item={panelToShow === 'settings'}>
                <a>
                    <Cog6ToothIcon/>
                    Settings</a></li>
        </ul>
    </div>
</div>

<style>

    .floating-div {
        position: absolute;
        z-index: 100;
    }

    .panel-container {
        display: none;
    }

    .visible {
        display: block;
    }

    .inner-panel-container {
        padding: 1em;
    }

</style>