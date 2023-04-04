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
            <li on:click={showModels} class:active-nav-item={panelToShow === 'models'}><a>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                </svg>

                Models</a></li>
            <li on:click={showData} class:active-nav-item={panelToShow === 'data'}>

                <a>                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                    Data</a></li>
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