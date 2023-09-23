<script lang="ts">
  import LoginForm from './LoginForm.svelte'
  import SignupForm from './SignupForm.svelte'
  import SocialSignIn from './SocialSignIn.svelte'

  let presentForm: 'login' | 'signup' = 'login'

  const switchForm = () => {
    presentForm = presentForm === 'login' ? 'signup' : 'login'
  }
</script>

<!-- TODO 
  - [ ] Add sign up form:
  - [ ] Add email input
  - [ ] Add password input
  - [ ] Add terms and conditions checkbox
  - [ ] Add sign up button
-->

<!-- TODO decide if we need these forms in different pages or in the same page -->
<!-- TODO LATER heading typing animation change -->

<!--  TODO forgot password functionality -->

<!-- bg-gradient-to-b from-primary/20 to-accent/50 text-base-content -->
<section
  class="form-section w-full flex-grow flex flex-col md:flex-row gap-6 md:gap-20 lg:gap-[15vw] items-center justify-center rounded-xl

"
>
  <!-- bg gradient divs -->
  <div class="absolute top-1/2 left-2/3 w-32 h-32 -z-40 bg-primary/80 blur-3xl " />
  <div class="absolute top-2/3 left-1/2 w-32 h-32 -z-40 bg-secondary/60 blur-3xl " />
  <div class="absolute top-1/3 left-1/3 w-32 h-32 -z-40 bg-accent/80 blur-3xl " />

  <div class="text-center md:text-start">
    <h1 class="lg:text-5xl xl:text-6xl 2xl:text-7xl mb-4 ">Welcome back!</h1>
    <p class="lg:text-xl opacity-50 tracking-tighter">
      Sign in or create an account to get started.
    </p>
  </div>

  <div
    class="w-96 p-8 py-10 rounded-xl
     shadow-xl
     glass bg-base-300/30 border-2 border-solid border-base-300
     "
  >
    <h2 class="mb-2">
      {presentForm === 'login' ? 'Log in' : 'Sign up'}
    </h2>
    <p class="opacity-70">
      {presentForm === 'login' ? 'Log in to your account' : 'Create an account to get started'}
    </p>
    <div class="divider" />

    {#if presentForm === 'login'}
      <LoginForm {switchForm} />
    {:else}
      <SignupForm {switchForm} />
    {/if}

    <div class="divider my-10 text-base-content/40">or</div>
    <SocialSignIn />
  </div>
</section>
