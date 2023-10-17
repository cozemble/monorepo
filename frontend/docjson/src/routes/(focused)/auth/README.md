# Auth
  All pages related to authentication.   

  ## Pages
  - [/sign-in](./sign-in/README.md)
  - [/sign-up](./sign-up/README.md)
  - [/reset-password](./reset-password/README.md)
    Handle both forgot password form and reset password form.
  - /callback
    Utility page for oauth providers to redirect to after authenticating the user.
    - Redirects to the given `redirectTo` parameter or [Dashboard](../../dashboard/README.md) page if sign-in was successful.
    - Redirects to the [Sign In](./sign-in/README.md) page if sign-in was unsuccessful.
  - /sign-out
    Utility page for signing out.
    - Redirects to the [Landing Homepage](../../(landing)/README.md)

  - ## OAuth Providers
    Sign in or create an account using an oauth provider.
    Used in both the sign in and sign up pages.
    - Supported social media accounts:
      - Github
      - Google
      - LinkedIn
   
  - ## Auth access
    All pages in this directory are only accessible if the user is not authenticated.
    - Redirect to [Dashboard](../../../dashboard/README.md) page if user is already authenticated

  > TODO IF NEEDED: 2fa