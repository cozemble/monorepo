<script lang="ts">

    export let value: string | null
    export let changeHandler: (value: string | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void

    function dateChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.value
        if (newValue !== value) {
            value = newValue
            changeHandler(value, null)
            closeHandler()
        }
    }

    function handleKeyDownInInput(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeHandler()
        }
    }

    function init(el: HTMLInputElement) {
        el.focus()
    }

</script>
{#if value}
    {value}
{:else}
    &nbsp;
{/if}

<div class="input-container absolute">
    <input class="input input-bordered date-input" type="date" {value} on:change={dateChanged} use:init
           on:keydown={handleKeyDownInInput}/>
</div>

<style>
    .absolute {
        position: absolute;
    }
</style>