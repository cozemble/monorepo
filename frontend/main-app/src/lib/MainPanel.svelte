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
<h2>Cozemble ({session.user.email})</h2>

<a href="#tab1" class="tab-item-name" class:current={panelToShow === 'models'} on:click={() => panelToShow='models'}>Models</a>
<a href="#tab2" class="tab-item-name" class:current={panelToShow === 'data'}
   on:click={() => panelToShow='data'}>Data</a>


<div class=tabs>
    <div id=tab1>
        <div class="panel-container" class:visible={panelToShow === 'models'}>
            <div class="inner-panel-container">
                <ModelsPanel/>
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
    .tab-item-name {
        border: solid 1px;
        padding: 0.3em;
    }

    .current {
        background-color: chartreuse;
    }

    .panel-container {
        margin-top: 0.5em;
        display: none;
        border-top: solid 1px;
    }

    .visible {
        display: block;
    }

    .inner-panel-container {
        margin-top: 1em;
        padding-left: 1em;
        padding-bottom: 1em;
        border-radius: 0.5em;
        border: 1px solid #ccc;
        background-color: lightcyan;
    }

</style>