<script lang="ts">
  export let switchForm: () => void
</script>

<!-- TODO functionality -->

<form action="/" method="post" class="card">
  <div class="form-control w-full mb-2">
    <label for="email" class="label">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      class="input input-bordered w-full"
      placeholder="you@example.com"
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
    <div class="label">
      <!-- Forgot password button -->
      <a
        href="/forgot-password"
        class="label-text-alt link-hover text-sm opacity-50 hover:opacity-70">Forgot password?</a
      >
    </div>
  </div>

  <div class="flex flex-col items-center mt-6">
    <button type="submit" class="btn btn-primary w-full">Sign in</button>
    <button class="link-hover pt-2 text-sm opacity-50 hover:opacity-70" on:click={switchForm}>
      or create an account
    </button>
  </div>
</form>
