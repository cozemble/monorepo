<script lang="ts">
    import type {DataRecord, DataRecordValuePath} from '@cozemble/model-core'
    import {dataRecordControlEvents, dataRecordEditEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let recordPath: DataRecordValuePath
    export let record: DataRecord

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = dataRecordValuePathFns.getValue(recordPath, record) ?? null
    let editableValue = dataRecordValuePathFns.getValue(recordPath, record) ?? ''

    let valueContainerDomElement: HTMLDivElement | null

    function init(el: HTMLDivElement) {
        valueContainerDomElement = el
        el.focus()
        setEndOfContenteditable(el)
    }

    function setEndOfContenteditable(contentEditableElement: HTMLElement) {
        let range, selection
        if (document.createRange) {
            //Firefox, Chrome, Opera, Safari, IE 9+
            range = document.createRange() //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement) //Select the entire contents of the element with the range
            range.collapse(false) //collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection() //get the selection object (allows you to change selection)
            if (selection) {
                selection.removeAllRanges() //remove any selections already made
                selection.addRange(range) //make the range you have just created the visible selection
            }
        }
    }

    function handleEditFinished(terminatingKey: 'Enter' | 'Tab' | null = null) {
        if (valueContainerDomElement) {
            const newValue = valueContainerDomElement.innerText
            if (newValue !== editableValue) {
                editableValue = newValue
                dataRecordEditorClient.dispatchEditEvent(
                    dataRecordEditEvents.valueChanged(
                        record,
                        recordPath,
                        initialValue,
                        newValue,
                        terminatingKey,
                    ),
                )
            }
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.target !== valueContainerDomElement) {
            return
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault()
            event.stopPropagation()
            handleEditFinished(event.key)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.editAborted(record, recordPath),
            )
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="value-container"
     contenteditable="true"
     use:init
     on:blur={() => handleEditFinished()}>
    {editableValue}
</div>

<style>
    .value-container {
        width: 100%;
        height: 100%;
        outline: 0 solid transparent;
    }
</style>
