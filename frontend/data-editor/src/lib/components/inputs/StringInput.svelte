<script lang="ts">
import uniqid from 'uniqid'

export let name: string
export let value: string
const id = uniqid('input-')
</script>

<div class="flex flex-col">
  <label for={id} class="label capitalize">{name}</label>
  <input type="text" {name} {id} class="input input-bordered" bind:value />
</div>
