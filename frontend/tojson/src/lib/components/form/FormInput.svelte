<script lang="ts">
  export let name: string
  /** Default: text */
  export let type: 'text' | 'password' = 'text'
  export let placeholder: string = ''
  export let value: string = ''
  export let error: string | undefined = undefined
</script>

<!-- 
  @component
    Text input for forms
    - Displays error message if error prop is passed
 -->

<div class="form-control w-full indicator">
  <label for={name} class="label capitalize">{name}</label>

  <!-- Svelte doesn't allow value binding when the type is dynamic -->
  {#if type === 'password'}
    <input
      type="password"
      id={name}
      {name}
      class="input input-bordered w-full {error && 'input-error'}"
      {placeholder}
      bind:value
    />
  {:else}
    <input
      type="text"
      id={name}
      {name}
      class="input input-bordered w-full {error && 'input-error'}"
      {placeholder}
      bind:value
    />
  {/if}

  <label for={name} class="label text-error py-1">
    <div />
    <label for="" class="label-text-alt text-error">
      {error || ''}
    </label>
  </label>
</div>
