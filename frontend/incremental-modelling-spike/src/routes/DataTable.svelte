<script lang="ts">
    import {computePosition} from '@floating-ui/dom';
    import type {DataRecord, Model, NestedModel} from "./types";
    import {dataRecordFns, modelFns} from "./types";
    import {tick} from "svelte";

    export let model: Model
    export let records: DataRecord[]
    let expandedRecordId: string | null = null
    let addingNestedModel = false
    let editingField = false
    let originalFieldName: string | null = null
    let editingFieldName: string | null = null
    let recordHavingNestedTableAdded: DataRecord | null = null

    async function addField() {
        const fieldName = `Field ${model.fields.length + 1}`
        model = modelFns.addField(model, fieldName)
        await tick()
        const element = document.querySelector(`th#field-${model.fields.length}`)
        console.log(element)
        if (element) {
            editFieldRelativeToAnchor(element, fieldName)
        }
    }

    async function addNestedTable(clicked: HTMLElement, record: DataRecord) {
        tableNameAsPlural = ""
        tableNameAsSingular = ""
        recordHavingNestedTableAdded = record
        const elem = document.activeElement;
        if (elem) {
            elem?.blur();
        }
        addingNestedModel = true
        const addNestedTableModal = document.querySelector('#add-nested-table-modal')
        computePosition(clicked.target.closest('td'), addNestedTableModal).then(({x, y}) => {
            x = Math.max(10, x)
            Object.assign(addNestedTableModal.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
        await tick()
        focusFirstInput('add-nested-table-modal')
    }

    function toggleRecordExpand(record: DataRecord) {
        if (expandedRecordId === record.id) {
            expandedRecordId = null
        } else {
            expandedRecordId = record.id
        }
    }

    function ensureNestedRecord(record: DataRecord, nestedModel: NestedModel) {
        if (!record.values[nestedModel.name]) {
            record.values[nestedModel.name] = []
        }
        return record.values[nestedModel.name]
    }

    function addRecord() {
        records = [...records, dataRecordFns.newInstance()]
    }

    let tableNameAsPlural = ""
    let tableNameAsSingular = ""

    function saveNestedTable() {
        model = modelFns.addNestedModel(model, tableNameAsSingular, tableNameAsPlural)
        if (recordHavingNestedTableAdded) {
            expandedRecordId = recordHavingNestedTableAdded.id
        }
        cancelNestedTable()
    }

    function cancelNestedTable() {
        addingNestedModel = false
        tableNameAsPlural = ""
        tableNameAsSingular = ""
        recordHavingNestedTableAdded = null
    }

    function editField(clicked: PointerEvent, field: string) {
        const anchorElement = clicked.target.closest('th')
        editFieldRelativeToAnchor(anchorElement, field)
    }

    async function editFieldRelativeToAnchor(anchorElement: Element, field: string) {
        editingFieldName = field
        originalFieldName = field
        editingField = true
        const modal = document.querySelector('#edit-field-modal')
        computePosition(anchorElement, modal).then(({x, y}) => {
            x = Math.max(10, x)
            Object.assign(modal.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
        await tick()
        focusFirstInput('edit-field-modal')
    }

    function focusFirstInput(divId: string) {
        const firstInput = document.querySelector(`#${divId} input.first`);
        if (firstInput) {
            firstInput.focus()
        }
    }

    function saveEditedField() {
        if (editingFieldName && originalFieldName) {
            model = modelFns.renameField(model, originalFieldName, editingFieldName)
        }
        cancelEditedField()
    }


    function cancelEditedField() {
        editingField = false
        originalFieldName = null
        editingFieldName = null
    }

    function deleteField() {
        const sure = confirm("Are you sure you want to delete this field?")
        if (sure) {
            if (editingFieldName) {
                model = modelFns.deleteField(model, editingFieldName)
                cancelEditedField()
            }
        }
    }
</script>

<div id="edit-field-modal" class="xabsolute-top" class:invisible={editingField === false}>
    <div class="modal-box  mx-8">
        <h3 class="font-bold text-lg">Edit field</h3>
        <div class="mt-2">
            <label>Field name</label><br/>
            <input type="text" class="input input-bordered w-full first" bind:value={editingFieldName}/>
        </div>
        <div class="mt-2">
            <label>Field type</label><br/>
            <select class="input input-bordered w-full">
                <option>Text</option>
                <option>Number</option>
                <option>Boolean</option>
                <option>Reference</option>
            </select>
        </div>
        <div class="mt-2">
            <div class="modal-action">
                <label class="btn btn-primary" on:click={saveEditedField}>Save</label>
                <label class="btn btn-secondary" on:click={cancelEditedField}>Close</label>
                <label class="btn btn-error" on:click={deleteField}>Delete Field</label>
            </div>
        </div>

    </div>
</div>

<div id="add-nested-table-modal" class="xabsolute-top" class:invisible={addingNestedModel === false}>
    <div class="modal-box  mx-8">
        <h3 class="font-bold text-lg">Add nested table to {model.name}</h3>
        <div class="mt-2">
            <label>Table name as plural</label><br/>
            <input id="table-name-as-plural" type="text" class="input input-bordered w-full first"
                   placeholder="Table name as plural" bind:value={tableNameAsPlural}/>
        </div>
        <div class="mt-2">
            <label>Table name as singular</label><br/>
            <input type="text" class="input input-bordered w-full" placeholder="Table name as singular"
                   bind:value={tableNameAsSingular}/>
        </div>
        <div class="modal-action">
            <label class="btn btn-primary" on:click={saveNestedTable}>Apply</label>
            <label class="btn btn-secondary" on:click={cancelNestedTable}>Cancel</label>
        </div>
    </div>
</div>

<table class="table">
    <thead>
    <tr>
        {#each model.fields as field, index}
            <th class="bg-base-300" id="field-{index + 1}">
                <div class="flex items-center"><span class="mr-1">{field}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="w-6 h-6" on:click={(elem) => editField(elem,field)}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                </div>
            </th>
        {/each}
        <td on:click={addField} class="bg-base-300 px-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
        </td>
        <td class="bg-base-300">Actions</td>
    </tr>
    </thead>
    <tbody>
    {#each records as record}
        <tr>
            {#each model.fields as field}
                <td class="border">{record.values[field] ?? ""} </td>
            {/each}
            <td class="border"></td>
            <td class="border">
                <div class="flex items-center">
                    {#if model.nestedModels.length > 0}
                        <button class="btn btn-ghost btn-active btn-sm" on:click={() => toggleRecordExpand(record)}>
                            {#if expandedRecordId === record.id}
                                Collapse
                            {:else}
                                Expand
                            {/if}
                        </button>
                    {/if}
                    <div class="dropdown">
                        <label tabindex="0" class="label m-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                 stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </label>
                        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li on:click={(elem) => addNestedTable(elem,record)}><a>Add nested table</a></li>
                        </ul>
                    </div>
                </div>
            </td>
        </tr>
        {#if expandedRecordId === record.id}
            <tr>
                <td class="border" colspan={model.fields.length + 2}>
                    <div class="nested-border border border-2 p-3">
                        {#each model.nestedModels as nestedModel}
                            {@const _nestedRecords = ensureNestedRecord(record, nestedModel)}
                            <div class="mb-5">
                                <h6>{nestedModel.pluralName}</h6>
                                <svelte:self bind:model={nestedModel.model}
                                             bind:records={record.values[nestedModel.name]}/>
                            </div>
                        {/each}
                    </div>
                </td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<div class="mt-2">
    <button class="btn btn-primary" on:click={addRecord}>Add {model.name}</button>
</div>

<style>
    .xabsolute-top {
        display: flex;
        position: absolute;
        z-index: 100;
    }

    .nested-border {
        border-top: none;
        border-right: none;
        border-bottom: none;
    }

</style>