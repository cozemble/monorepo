<script lang="ts">
  import ForgotPasswordFrom from './ForgotPasswordFrom.svelte'
</script>

<div
  class="card w-full sm:w-[30rem] lg:w-[35rem] md:mt-10 flex flex-col items-center justify-center"
>
  <h1
    class="text-center 
    text-3xl mb-4
    md:text-4xl md:mb-6
    "
  >
    Forgot password?
  </h1>

  <p class="text-center text-sm md:text-base lg:text-lg opacity-60">
    Enter your email address and we will send you a link to reset your password.
  </p>

  <ForgotPasswordFrom />

  <span class="mt-14 text-sm text-base-content/70">
    If you still need help, check out
    <a href="/contact" class="link hover:text-secondary">Contact </a>
  </span>

  <div class="join mt-4">
    <a href="/auth/sign-in" class="mt-4 btn btn-ghost btn-sm join-item">Sign in</a>
    <a href="/auth/sign-up" class="mt-4 btn btn-ghost btn-sm join-item">Sign Up</a>
  </div>
</div>
