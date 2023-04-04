<script lang="ts">
    import {onMount} from "svelte";
    import {
        registerAllProperties,
        registerAllPropertyConfigurers,
        registerAllSlotEditors,
        registerAllSlotViewers
    } from '@cozemble/model-assembled'
    import ModelsPanel from './models/ModelsPanel.svelte'
    import type {Session} from "./auth/cozauth";
    import DataPanel from "../lib/data/DataPanel.svelte";

    export let session: Session
    export let tenantId: string
    let panelToShow: "models" | "data" = "models"

    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        registerAllSlotViewers()
        registerAllSlotEditors()
    })

    function showModels() {
        panelToShow = "models"
    }

    function showData() {
        panelToShow = "data"
    }
</script>

<div class="drawer drawer-mobile">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle"/>
    <div class="drawer-content">
        <!-- Page content here -->
        <div class="tabs ml-2" style="display: block;">
            <div id=tab1>
                <div class="panel-container" class:visible={panelToShow === 'models'}>
                    <div class="inner-panel-container">
                        <ModelsPanel {tenantId}/>
                    </div>
                </div>
            </div>
            <div id=tab2>
                <div class="panel-container" class:visible={panelToShow === 'data'}>
                    <div class="inner-panel-container">
                        <DataPanel {tenantId}/>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="drawer-side border">
        <label for="my-drawer-2" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 bg-base-100 text-base-content">
            <!-- Sidebar content here -->
            <li on:click={showModels} class:active-nav-item={panelToShow === 'models'}><a>Models</a></li>
            <li on:click={showData} class:active-nav-item={panelToShow === 'data'}><a>Data</a></li>
        </ul>

    </div>
</div>




<style>

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