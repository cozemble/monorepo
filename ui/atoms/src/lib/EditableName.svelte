<script lang="ts">
import Editable from './Editable.svelte'

export let nameable: { name: string }
export let onNameChange: (name: string) => void
export let editImmediately = false
export let extraClass = ''

function nameChanged(event: CustomEvent) {
  onNameChange(event.detail.newValue)
}
</script>

<div class="d-flex">
  <h5>
    <Editable
      value={nameable.name}
      {extraClass}
      on:edited={nameChanged}
      {editImmediately}
    />
  </h5>
</div>
