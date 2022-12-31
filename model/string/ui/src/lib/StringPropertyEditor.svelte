<script lang="ts">
    import type {DataRecord, DataRecordPath} from "@cozemble/model-core";
    import {dataEditor, dataEditorEvents} from "@cozemble/model-editor-sdk";

    export let recordPath: DataRecordPath
    export let record: DataRecord

    const dataEditorClient = dataEditor.getClient()
    const initialValue = recordPath.getValue(record) ?? null
    const editableValue = recordPath.getValue(record) ?? ""

    let valueContainerDomElement: HTMLDivElement | null

    function init(el: HTMLDivElement) {
        valueContainerDomElement = el
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
            if (selection) {
                selection.removeAllRanges();//remove any selections already made
                selection.addRange(range);//make the range you have just created the visible selection
            }
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault()
            event.stopPropagation()
            if (valueContainerDomElement) {
                const newValue = valueContainerDomElement.innerText
                dataEditorClient.dispatchEditEvent(dataEditorEvents.valueChanged(record, recordPath,initialValue, newValue, event.key))
            }
        } else if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            dataEditorClient.dispatchEditEvent(dataEditorEvents.editAborted(record, recordPath))
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="value-container" contenteditable="true" use:init>
    {editableValue}
</div>

<style>
    .value-container {
        width: 100%;
        height: 100%;
        outline: 0 solid transparent;
    }
</style>
