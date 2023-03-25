<script lang="ts">
import dayjs from 'dayjs'

interface Value {
  from: string
  to: string
}

export let schema: CozJSONSchema
export let value: Value
export let error: ObjectError

/**  This is a hack to get around the fact that date input value is in format of 'YYYY-MM-DD'*/
let inputValue = {
  from: dayjs(!!value.from ? value.from : Date.now()).format('YYYY-MM-DD'),
  to: dayjs(!!value.to ? value.to : Date.now()).format('YYYY-MM-DD'),
}

// update the value when the inputValue changes
$: value = {
  from: new Date(inputValue.from).toISOString(),
  to: new Date(inputValue.to).toISOString(),
}
</script>

<!--
  @component
  A date range input field. 
  - Consists of two date inputs.
  - Form is opened in a modal.
  
-->

<!-- The button to open modal -->
<label for="my-modal-4" class="btn btn-ghost"
  >{inputValue.from} - {inputValue.to}</label
>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="my-modal-4" class="modal-toggle" />
<label for="my-modal-4" class="modal cursor-pointer">
  <label class="modal-box relative" for="">
    <h3 class="text-lg font-bold">Edit Date Range</h3>

    <div class="flex flex-col">
      <label class="flex flex-col">
        <span>From</span>
        <input
          type="date"
          bind:value={inputValue.from}
          class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
        />
      </label>

      <label class="flex flex-col">
        <span>To</span>
        <input
          type="date"
          bind:value={inputValue.to}
          class="input input-ghost w-full {error && 'input-error'} w-full pr-0"
        />
      </label>
    </div></label
  >
</label>
