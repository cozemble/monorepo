<script lang="ts">
    import {type DataRecord, type Model, modelFns} from "./types";
    import DataTable from "./DataTable.svelte";
    import {writable, type Writable} from "svelte/store";
    import {tick} from "svelte";
    import {computePosition} from '@floating-ui/dom';


    const navbarState: Writable<string | null> = writable(null)
    let models: Model[] = []
    let recordMap: { [modelName: string]: DataRecord[] } = {}
    let modelBeingEdited: Model | null = null
    $: indexOfModel = models.findIndex(model => model.id === $navbarState)

    let model = modelFns.newInstance("Customer", "Customers")
    model = modelFns.addField(model, "First name")

    // models = [...models, model]

    function showModel(modelId: string) {
        const maybeRecords = recordMap[modelId]
        if (!maybeRecords) {
            recordMap[modelId] = []
        }
        navbarState.set(modelId)
    }

    async function addTable() {
        const tableName = `Table ${models.length + 1}`
        const newModel = modelFns.newInstance(tableName, tableName)
        models = [...models, newModel]
        await tick()
        editModel(newModel)
        showModel(newModel.id)
    }

    function onEditModelClicked(clicked: Event, model: Model) {
        clicked.stopPropagation()
        editModel(model)
    }

    function focusFirstInput(divId: string) {
        const firstInput = document.querySelector(`#${divId} input.first`);
        if (firstInput && firstInput instanceof HTMLInputElement) {
            firstInput.focus()
        }
    }


    async function editModel(model: Model) {
        modelBeingEdited = model
        await tick()
        const indexOfModel = models.findIndex(model => model.id === modelBeingEdited?.id)
        if (indexOfModel >= 0) {
            const modelTab = document.querySelector(`.model-${indexOfModel + 1}`)
            const modal = document.getElementById("edit-model-modal")
            if (modelTab && modal) {
                computePosition(modelTab, modal).then(({x, y}) => {
                    x = Math.max(10, x)
                    Object.assign(modal.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });
                });
                await tick()
                focusFirstInput('edit-model-modal')
            }
        }
    }

    function saveTableEdit() {
        models = models.map(model => {
            if (model.id === modelBeingEdited?.id) {
                return modelBeingEdited
            }
            return model
        })
        cancelTableEdit()
    }

    function cancelTableEdit() {
        modelBeingEdited = null
    }
</script>

<div id="edit-model-modal" class="xabsolute-top" class:invisible={modelBeingEdited === null}>
    <div class="modal-box  mx-8">
        {#if modelBeingEdited !== null}
            <h3 class="font-bold text-lg">Editing {modelBeingEdited.name}</h3>
            <div class="mt-2">
                <label>Table name as plural</label><br/>
                <input id="table-name-as-plural" type="text" class="input input-bordered w-full first"
                       bind:value={modelBeingEdited.pluralName}/>
            </div>
            <div class="mt-2">
                <label>Table name as singular</label><br/>
                <input type="text" class="input input-bordered w-full" placeholder="Table name as singular"
                       bind:value={modelBeingEdited.name}/>
            </div>
        {/if}
        <div class="modal-action">
            <label class="btn btn-primary" on:click={saveTableEdit}>Apply</label>
            <label class="btn btn-secondary" on:click={cancelTableEdit}>Cancel</label>
        </div>
    </div>
</div>

<div class="tabs bg-base-300 rounded p-1">
    {#each models as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered mr-2 model-{index + 1}" class:tab-active={$navbarState === model.id}
               on:click={() => showModel(model.id)}>{model.pluralName}</a>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-6 h-6" on:click={(elem) => onEditModelClicked(elem,model)}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
        </div>
    {/each}
    {#if models.length === 0}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add your first table</a>
    {:else}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add table</a>
    {/if}
</div>

<br/>
{#if indexOfModel >= 0}
    <DataTable bind:model={models[indexOfModel]} bind:records={recordMap[models[indexOfModel].id]}/>
{/if}

<style>
    .xabsolute-top {
        display: flex;
        position: absolute;
        z-index: 100;
    }

</style>