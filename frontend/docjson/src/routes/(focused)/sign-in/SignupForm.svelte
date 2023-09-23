<script lang="ts">
  export let switchForm: () => void
</script>

<!-- TODO functionality -->

<form action="/" method="post" class="card">
  <div class="form-control w-full mb-2">
    <label for="email" class="label">Name</label>
    <input
      type="text"
      id="name"
      name="name"
      class="input input-bordered w-full"
      placeholder="Your Name"
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
      <input type="checkbox" class="checkbox checkbox-primary" />
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
