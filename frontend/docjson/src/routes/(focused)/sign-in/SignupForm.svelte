<script lang="ts">
  import { enhance } from '$app/forms'

  export let switchForm: () => void
  export let form: Record<string, string>

  let helperText: HelperText = { error: false, text: null };

</script>

<!-- TODO functionality -->

<!-- TODO handle error message-->
<!-- svelte-ignore empty-block -->
{#if !!helperText.text}
{/if}

<form action="?/signup" method="post" class="card" use:enhance>
  <div class="form-control w-full mb-2">
    <label for="name" class="label">Name</label>
    <input
      type="text"
      id="name"
      name="name"
      class="input input-bordered w-full"
      placeholder="Your Name"
      value={form?.name ?? ''}
    />
  </div>

  <div class="form-control w-full mb-2">
    <label for="email" class="label">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      class="input input-bordered w-full"
      placeholder="you@example.com"
      value={form?.email ?? ''}
    />
  </div>

  <div class="form-controll w-full">
    <label for="password" class="label">Password</label>
    <input
      type="password"
      id="password"
      name="password"
      class="input input-bordered w-full"
      placeholder="••••••••"
    />
  </div>

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
