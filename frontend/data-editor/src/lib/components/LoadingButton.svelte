<script lang="ts">
export let action: () => Promise<void>
export let properties: Record<string, any> | undefined = undefined

let loading = false

const onClick = async () => {
  loading = true

  await action()

  loading = false
}
</script>

<button
  class="btn btn-secondary self-end"
  class:loading
  on:click={onClick}
  disabled={loading}
  {...properties}
>
  <slot />
</button>
