<script lang="ts">
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

  <UpdatePasswordForm />
</div>
