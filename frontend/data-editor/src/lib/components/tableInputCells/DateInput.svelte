<script lang="ts">
	import dayjs from 'dayjs'
	import CellInputWrapper from './CellInputWrapper.svelte'

	export let value: Date

	/**  This is a hack to get around the fact that date input value is in format of 'YYYY-MM-DD'*/
	let inputValue = dayjs(value).format('YYYY-MM-DD')

	// update the value when the inputValue changes
	$: value = new Date(inputValue)

	$: error = value !== null && value.toString().length < 1 ? 'Required' : undefined
</script>

<CellInputWrapper {error}>
	<input
		type="date"
		bind:value={inputValue}
		class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
	/>
</CellInputWrapper>
