<script lang="ts">
  import { enhance } from '$app/forms'
  import FormInput from '$lib/components/form/FormInput.svelte'

  export let switchForm: () => void
  export let form: Record<string, string>

  let helperText: HelperText = { error: false, text: null };

</script>

<!-- TODO functionality -->
<!-- TODO display check your email after submit -->

<!-- TODO handle error message-->
<!-- svelte-ignore empty-block -->
{#if !!helperText.text}
{/if}

<form action="?/signup" method="post" class="card" use:enhance>

  <FormInput name="name" value={form?.name ?? ''} placeholder="Your Name" />

  <FormInput
    name="email"
    value={form?.email ?? ''}
    placeholder="you@example.com"
  />

  <FormInput
    name="password"
    value={form?.password ?? ''}
    placeholder="••••••••"
    type="password"
  />

  <div class="form-control mt-4">
    <label class="label cursor-pointer">
      <input type="checkbox" name="term" class="checkbox checkbox-primary" />
      <span class="label-text">I accept the privacy policy and terms of use </span>
    </label>
  </div>

  <div class="flex flex-col items-center mt-6">
    <button type="submit" class="btn btn-primary w-full">Sign in</button>
    <button class="link-hover pt-2 text-sm opacity-50 hover:opacity-70" on:click={switchForm}>
      already have an account?
    </button>
  </div>
</form>
