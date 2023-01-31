<script lang="ts">
	export let value: string
	export let options: string[]

	import CellInputWrapper from './CellInputWrapper.svelte'
</script>

<CellInputWrapper error={undefined}>
	<select class="select select-ghost " bind:value>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</CellInputWrapper>
