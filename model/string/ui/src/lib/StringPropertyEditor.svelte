<script lang="ts">
    import type {DataRecord, Property} from "@cozemble/model-core";

    export let property: Property
    export let record: DataRecord

    $:value = property.getValue(record) ?? ""

    function init(el: HTMLElement) {
        el.focus()
        setEndOfContenteditable(el)
    }

    function setEndOfContenteditable(contentEditableElement: HTMLElement) {
        let range, selection;
        if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            if(selection) {
                selection.removeAllRanges();//remove any selections already made
                selection.addRange(range);//make the range you have just created the visible selection
            }
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            event.preventDefault()
            event.stopPropagation()
            property.setValue(record, value)
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="value-container" contenteditable="true" use:init>
    {value}
</div>

<style>
    .value-container {
        width: 100%;
        height: 100%;
        outline: 0 solid transparent;
    }
</style>
