<script lang="ts">
  import SignupForm from './SignupForm.svelte'
  import AuthPageLayout from '../AuthPageLayout.svelte'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  onMount(() => {
    page.subscribe(() => {
      console.log($page)
    })
  })
</script>

<AuthPageLayout
  formTitle="Sign Up"
  heading="Get started!"
  subheading="Create an account to start using our services"
  otherPageLinkName="already have an account?"
  otherPageLink="/auth/sign-in"
>
  <SignupForm slot="form" />
</AuthPageLayout>
