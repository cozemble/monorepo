<script lang="ts">
    export let value: number | null
    export let numberOfDecimalPlaces: number
    export let changeHandler: (value: number | null, submitEvent: KeyboardEvent | null) => void

    function decimalChanged(event: Event) {
        const target = event.target as HTMLInputElement
        let newValue = parseFloat(target.value) as number | null

        if (newValue === null || isNaN(newValue)) {
            newValue = null
        }
        changeHandler(newValue, null)
    }

    function validateInput(event: KeyboardEvent) {
        const target = event.target as HTMLInputElement
        const decimalPart = target.value.split('.')[1] || ''

        // Check if selectionStart is null and provide a default value of 0
        const selectionStart = target.selectionStart ?? 0;

        // allow metaKey combinations (like CMD+A, CMD+C, etc.), and functional keys like Tab, Enter, Escape, arrow keys, Home, End, PageUp, PageDown, and Insert
        if (event.metaKey || ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Insert'].includes(event.key)) return;

        // check if the pressed key was not a number, and not a decimal or control key, or if the decimal part is already at maximum length
        if ((isNaN(Number(event.key)) && event.key !== '.' && !['Backspace', 'Delete'].includes(event.key))
            || (event.key === '.' && target.value.includes('.'))
            || (decimalPart.length >= numberOfDecimalPlaces && !isNaN(Number(event.key)) && selectionStart > target.value.indexOf('.'))) {
            event.preventDefault()
        }
    }

    function validatePaste(event: Event) {
        const target = event.target as HTMLInputElement;
        const decimalPart = target.value.split('.')[1] || '';
        if (decimalPart.length > numberOfDecimalPlaces) {
            target.value = target.value.slice(0, target.value.indexOf('.') + numberOfDecimalPlaces + 1);
        }
    }

</script>

<input
        class="input input-bordered"
        type="text"
        {value}
        on:input={validatePaste}
        on:keydown={validateInput}
        on:change={decimalChanged}/>
        