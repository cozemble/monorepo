<script lang="ts">
    export let addSlotToModel: () => void;
    export let addInnerTable: () => void;
    export let addInnerRecord: () => void;

    function onClick(item:'field'|'subTable'|'subRecord') {
        const elem = document.activeElement as HTMLElement;
        if(elem){
            elem?.blur();
        }
        if (item === 'field') {
            addSlotToModel()
        } else if (item === 'subTable') {
            addInnerTable()
        } else if (item === 'subRecord') {
            addInnerRecord()
        }
    }
</script>

<div class="dropdown add-model-element">
    <label tabindex="0" class="label m-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
             stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        <span class="ml-2">Add</span></label>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a class="add-field" on:click={() => onClick('field')}>Field</a></li>
        <li><a class="add-sub-record" on:click={() => onClick('subRecord')}>Inner record</a></li>
        <li><a class="add-sub-table" on:click={() => onClick('subTable')}>Inner table</a></li>
    </ul>
</div>