<script lang="ts">
  import SignupForm from './SignupForm.svelte'
  import AuthPageLayout from '../AuthPageLayout.svelte'

  export let form: Record<string, string>
</script>

<AuthPageLayout
  formTitle="Sign Up"
  heading="Get started!"
  subheading="Create an account to start using our services"
  otherPageLinkName="already have an account?"
  otherPageLink="/auth/sign-in"
>
  <SignupForm {form} slot="form" />
</AuthPageLayout>
