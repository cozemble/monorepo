<script lang="ts">
    import {onMount} from "svelte";
    import {
        registerAllProperties,
        registerAllPropertyConfigurers,
        registerAllSlotEditors,
        registerAllSlotViewers,
        registerAllSystemConfigurations
    } from '@cozemble/model-assembled'
    import ModelsPanel from './models/ModelsPanel.svelte'
    import DataPanel from "../lib/data/DataPanel.svelte";
    import PuzzlePieceIcon from "../lib/icons/PuzzlePieceIcon.svelte";
    import DatabaseIcon from "../lib/icons/DatabaseIcon.svelte";
    import Cog6ToothIcon from "./icons/Cog6ToothIcon.svelte";
    import SettingsPanel from "./settings/SettingsPanel.svelte";

    export let tenantId: string
    let panelToShow: "models" | "data" | "settings" = "models"

    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        registerAllSlotViewers()
        registerAllSlotEditors()
        registerAllSystemConfigurations()
    })

    function showModels() {
        panelToShow = "models"
    }

    function showData() {
        panelToShow = "data"
    }

    function showSettings() {
        panelToShow = "settings"
    }
</script>

<div class="drawer drawer-mobile">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle"/>
    <div class="drawer-content">
        <!-- Page content here -->
        <div class="tabs ml-2">
            <div>
                <div class="panel-container" class:visible={panelToShow === 'models'}>
                    <div class="inner-panel-container">
                        <ModelsPanel {tenantId}/>
                    </div>
                </div>
            </div>
            <div>
                <div class="panel-container" class:visible={panelToShow === 'data'}>
                    <div class="inner-panel-container">
                        <DataPanel {tenantId}/>
                    </div>
                </div>
            </div>
            <div>
                <div class="panel-container" class:visible={panelToShow === 'settings'}>
                    <div class="inner-panel-container">
                        <SettingsPanel {tenantId}/>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="drawer-side border">
        <label for="my-drawer-2" class="drawer-overlay"></label>
        <ul class="menu p-4 w-80 bg-base-100 text-base-content">
            <h2 class="mb-2">Cozemble</h2>
            <!-- Sidebar content here -->
            <li on:click={showModels} class:active-nav-item={panelToShow === 'models'}>
                <a>
                    <PuzzlePieceIcon/>
                    Models</a></li>
            <li on:click={showData} class:active-nav-item={panelToShow === 'data'}>
                <a>
                    <DatabaseIcon/>
                    Data</a></li>
            <li on:click={showSettings} class:active-nav-item={panelToShow === 'settings'}>
                <a>
                    <Cog6ToothIcon/>
                    Settings</a></li>
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