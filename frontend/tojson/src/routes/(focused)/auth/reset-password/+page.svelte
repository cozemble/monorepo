<script lang="ts">
  import user from '$lib/stores/user'
  import ForgotPasswordFrom from './ForgotPasswordFrom.svelte'
  import UpdatePasswordForm from './UpdatePasswordForm.svelte'
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
    Reset Password
  </h1>

  <p class="mb-10 lg:mb-14 text-center text-sm md:text-base lg:text-lg opacity-60">
    Enter your new password
  </p>

  {#if $user.isGuest}
    <ForgotPasswordFrom />

    <span class="mt-14 text-sm text-base-content/70">
      If you still need help, check out
      <a href="/contact" class="link hover:text-secondary">Contact </a>
    </span>

    <div class="join mt-4">
      <a href="/auth/sign-in" class="mt-4 btn btn-ghost btn-sm join-item">Sign in</a>
      <a href="/auth/sign-up" class="mt-4 btn btn-ghost btn-sm join-item">Sign Up</a>
    </div>

    <!--  -->
  {:else}
    <UpdatePasswordForm />
  {/if}

  <!--  -->
</div>
