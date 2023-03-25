<script lang="ts">
    import {onMount} from "svelte";
    import {
        registerAllProperties,
        registerAllPropertyConfigurers,
        registerAllPropertyEditors,
        registerAllPropertyViewers
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
        registerAllPropertyViewers()
        registerAllPropertyEditors()
    })
</script>

<div class="navbar bg-base-300 rounded-xl">
    <div>
        <a class="btn btn-ghost normal-case text-xl">Cozemble</a>
    </div>
    <div>
        <ul class="menu menu-horizontal px-1">
            <li on:click={() => panelToShow='models'} class:active-nav-item={panelToShow === 'models'}><a>Models</a></li>
            <li on:click={() => panelToShow='data'} class:active-nav-item={panelToShow === 'data'}><a>Data</a></li>
        </ul>
    </div>
</div>


<div class=tabs>
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

<style>

    .panel-container {
        margin-top: 0.5em;
        display: none;
    }

    .visible {
        display: block;
    }

    .inner-panel-container {
        margin-top: 1em;
        padding: 1em;
        border-radius: 0.5em;
        border: 1px solid #ccc;
    }

</style>