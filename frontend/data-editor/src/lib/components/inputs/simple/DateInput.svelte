<script lang="ts">
import dayjs from 'dayjs'

export let value: string
export let error: string | undefined = undefined
export let readonly: boolean = false

/**  This is a hack to get around the fact that date input value is in format of 'YYYY-MM-DD'*/
let inputValue = dayjs(!!value ? value : Date.now()).format('YYYY-MM-DD')

// update the value when the inputValue changes
$: value = new Date(inputValue).toISOString()
</script>

<input
  type="date"
  bind:value={inputValue}
  class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
  {readonly}
  disabled={readonly}
/>
