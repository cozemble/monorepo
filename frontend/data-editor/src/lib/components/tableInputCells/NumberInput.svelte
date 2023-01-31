<script lang="ts">
	import CellInputWrapper from './CellInputWrapper.svelte'

	export let value: number

	$: error =
		value === null || value === undefined || value.toString().length < 1 ? 'Required' : undefined
</script>

<CellInputWrapper {error}>
	<input
		type="number"
		bind:value
		class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
		size={value?.toString().length || 1}
	/>
</CellInputWrapper>

<style lang="postcss">
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-webkit-appearance: textfield;
	}
</style>
