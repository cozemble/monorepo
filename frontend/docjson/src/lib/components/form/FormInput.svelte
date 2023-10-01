<script lang="ts">
  export let name: string
  /** Default: text */
  export let type: 'text' | 'password' | 'email' = 'text'
  export let placeholder: string = ''
  export let value: string = ''
  export let error: string | undefined = undefined
</script>

<!-- 
  @component
    Text input for forms
    - Displays error message if error prop is passed
 -->

<div class="form-control w-full mb-2 indicator">
  <label for={name} class="label capitalize">{name}</label>

  <input
    {type}
    id={name}
    {name}
    class="input input-bordered w-full {error && 'input-error'}"
    {placeholder}
    {value}
  />

  <label for={name} class="label text-error pb-0 pt-1">
    <div />
    <label for="" class="label-text-alt text-error">
      {error || ''}
    </label>
  </label>
</div>
