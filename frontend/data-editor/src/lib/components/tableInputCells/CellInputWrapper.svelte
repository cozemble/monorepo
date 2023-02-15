<script lang="ts">
/** Error message to show in the tooltip, if any. */
export let error: string | undefined
//
</script>

<!--
  @component
  This component is used to wrap the input element in a table cell.
	
	Displays the error message in a tooltip if there is an error.
	
	@slot 
	The input element.

-->

<td class="p-0 min-w-max relative ">
  <div
    class="inline {error &&
      'tooltip tooltip-error tooltip-bottom tooltip-open'}"
    data-tip={error || ''}
  >
    <slot />
  </div>
</td>
