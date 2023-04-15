<script lang="ts">
    import {createEventDispatcher, onMount} from 'svelte'

    export let value: string
    export let editImmediately = false
    export let extraClass = ''
    let inputElement: HTMLInputElement | null = null

    let editing = false
    let initialValue = value
    let editableValue = value

    function edit() {
        editing = true
    }

    const dispatch = createEventDispatcher()

    function finishedEditing() {
        if (editableValue !== value) {
            dispatch('edited', {oldValue: value, newValue: editableValue})
            editableValue = value
        }
        editing = false
    }

    function maybeFinishedEditing(event: KeyboardEvent) {
        if (event.target === inputElement) {
            if (event.code === 'Enter') {
                finishedEditing()
            }
            if (event.code === 'Escape') {
                value = initialValue
                editableValue = initialValue
                finishedEditing()
            }
        }
    }

    function takeFocus(element: HTMLInputElement) {
        inputElement = element
        element.focus()
        if (editImmediately) {
            element.select()
        }
    }

    onMount(() => {
        if (editImmediately) {
            edit()
        }
    })
</script>

<svelte:window on:keydown={maybeFinishedEditing}/>

{#if editing}
    <input
            type="text"
            class={extraClass}
            bind:value={editableValue}
            on:blur={finishedEditing}
            use:takeFocus
    />
{:else}
    <div on:click={edit} class={extraClass}>
        {value}
    </div>
{/if}
