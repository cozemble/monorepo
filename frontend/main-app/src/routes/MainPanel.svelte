<script lang="ts">
    import type {CombinedUser} from "../lib/supabase/flattened_types";
    import {onMount} from "svelte";
    import {registerAllProperties, registerAllPropertyConfigurers,} from '@cozemble/model-assembled'
    import {registerStringPropertyEventToSqlActions} from '@cozemble/model-string-sql-actions'
    import {bootstrapHost} from "./host";
    import ModelsPanel from './ModelsPanel.svelte'
    import DataPanel from './DataPanel.svelte'
    import type {ModelEditorHost} from "@cozemble/model-editor";

    export let user: CombinedUser
    export let host: ModelEditorHost
    let panelToShow: "models" | "data" = "models"

    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        registerStringPropertyEventToSqlActions()
        bootstrapHost(localStorage)
    })
</script>
<h2>Hello {user.user.first_name} ({user.authUser.email})</h2>

<a href="#tab1" class="tab-item-name" class:current={panelToShow === 'models'} on:click={() => panelToShow='models'}>Models</a>
<a href="#tab2" class="tab-item-name" class:current={panelToShow === 'data'}
   on:click={() => panelToShow='data'}>Data</a>

<div class=tabs>
    <div id=tab1>
        <div class="panel-container" class:visible={panelToShow === 'models'}>
            <ModelsPanel {host}/>
        </div>
    </div>
    <div id=tab2>
        <div class="panel-container" class:visible={panelToShow === 'data'}>
            <DataPanel/>
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
</style>