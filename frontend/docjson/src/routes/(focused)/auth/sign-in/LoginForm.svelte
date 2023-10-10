<script lang="ts">
  import { enhance } from '$app/forms'
  import FormInput from '$lib/components/form/FormInput.svelte'

  export let form: Record<string, string>
</script>

<!-- TODO functionality -->

<form action="?/signin" method="post" class="card" use:enhance>
  <FormInput name="email" value={form?.email ?? ''} placeholder="you@example.com" />

  <FormInput name="password" value={form?.password ?? ''} placeholder="••••••••" type="password" />

  <!-- Forgot password button -->
  <a href="/forgot-password" class="label-text-alt link-hover text-sm opacity-50 hover:opacity-70"
    >Forgot password?</a
  >

  <div class="flex flex-col items-center mt-6">
    <button type="submit" class="btn btn-primary w-full">Sign in</button>
  </div>
</form>
