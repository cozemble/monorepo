<script lang="ts">

    import Cog6ToothIcon from "../icons/Cog6ToothIcon.svelte";
    import GenerativeIcon from "../icons/GenerativeIcon.svelte";
    import SettingsPanel from "../settings/SettingsPanel.svelte";
    import DatabaseIcon from "../icons/DatabaseIcon.svelte";
    import UserInstructionNotices from "../notices/UserInstructionNotices.svelte";
    import ToastNotices from "../notices/ToastNotices.svelte";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onDestroy, onMount} from "svelte";
    import IncrementalModelingData from "./IncrementalModelingData.svelte";
    import GenerativeAIData from "../generative/GenerativeAiModeling.svelte";
    import {IncrementalModelingBackend} from "./IncrementalModelingBackend";
    import type {Backend as DataTableBackend} from "@cozemble/frontend-datatable";
    import {backendFns} from "@cozemble/frontend-datatable";
    import {eventSourcedModels, models, permitModelling} from "./incrementalModelStore";
    import type {EventSourcedModel, EventSourcedModelList} from "@cozemble/model-event-sourced";
    import {toastNoticeStoreFns} from "../notices/toastNoticeStore";
    import {backend} from "../backend/backendStore";

    export let tenantId: string
    let panelToShow: "data" | "generative" | "settings" = "data"
    let dataTableBackend: DataTableBackend = backendFns.setBackend(new IncrementalModelingBackend(backend, tenantId, () => $models))
    let viewAs: "developer" | "user" = "developer"

    onMount(() => {
        registerEverything()
    })

    let lastSavedModels: EventSourcedModel[] = []
    const unsubModels = eventSourcedModels.subscribe(async (list: EventSourcedModelList) => {
        const models = list.models
        if (lastSavedModels.length === 0) {
            lastSavedModels = models
        } else {
            saveModels(models)
            lastSavedModels = models
        }
    })

    async function saveModels(models: EventSourcedModel[]) {
        if (dataTableBackend === null) {
            throw new Error("Backend is null")
        } else {
            const saveOutcome = await dataTableBackend.saveModels(models)
            if (saveOutcome !== null) {
                toastNoticeStoreFns.add(saveOutcome.message, "error")
            }
        }
    }

    onDestroy(() => {
        unsubModels()
    })

    function viewAsChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        permitModelling.update(p => target.value === 'developer')
    }

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
                            <IncrementalModelingData {dataTableBackend}/>
                        {:else if panelToShow === 'generative'}
                            <GenerativeAIData/>
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
                    Data</a>
            </li>
            <li on:click={() => panelToShow = 'generative'} class:active-nav-item={panelToShow === 'generative'}>
                <a>
                    <GenerativeIcon/>
                    Generative AI</a>
            </li>
            <li on:click={() => panelToShow = 'settings'} class:active-nav-item={panelToShow === 'settings'}>
                <a>
                    <Cog6ToothIcon/>
                    Settings</a>
            </li>

            <label class="label">View as:</label>
            <select class="select select-bordered" on:change={viewAsChanged}>
                <option value="developer" selected={viewAs === 'developer'}>Developer</option>
                <option value="user" selected={viewAs === 'user'}>User</option>
            </select>
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

    .drawer-content {
        z-index: 100;
    }
</style>