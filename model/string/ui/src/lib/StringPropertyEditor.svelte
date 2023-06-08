<script lang="ts">
    import type {StringProperty} from "@cozemble/model-string-core";

    export let value: string | null
    export let property: StringProperty
    export let changeHandler: (value: string|null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void

    $: nullSafeValue = value ?? ''

    let valueContainerDomElement: HTMLDivElement | null

    function init(el: HTMLDivElement) {
        valueContainerDomElement = el
        el.focus()
        el.innerHTML = nullSafeValue.replace(/\n/g, '<br>');
        setEndOfContenteditable(el)
    }

    function setEndOfContenteditable(contentEditableElement: HTMLElement) {
        let range, selection
        if (document.createRange) {
            //Firefox, Chrome, Opera, Safari, IE 9+
            range = document.createRange() //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement) //Select the entire contents of the element with the range
            range.collapse(false) //collapse the range to the end point. false means collapse to end rather than the start˚
            selection = window.getSelection() //get the selection object (allows you to change selection)
            if (selection) {
                selection.removeAllRanges() //remove any selections already made
                selection.addRange(range) //make the range you have just created the visible selection
            }
        }
    }

    function handleEditFinished(event: KeyboardEvent | null = null) {
        if (valueContainerDomElement) {
            changeHandler(valueContainerDomElement.innerText, event)
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.target !== valueContainerDomElement) {
            return
        }
        if (event.key === 'Enter' && property.multiline) {
            return
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault()
            event.stopPropagation()
            handleEditFinished(event)
        } else if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            closeHandler()
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="value-container"
     contenteditable="true"
     use:init
     on:blur={() => handleEditFinished()}>
    {nullSafeValue}
</div>

<style>
    .value-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        outline: none;
        resize: both;
    }
</style>
