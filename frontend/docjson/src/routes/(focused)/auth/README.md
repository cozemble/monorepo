# Auth
  All pages related to authentication.   

  ## Pages
  - [/sign-in](./sign-in/README.md)
  - [/sign-up](./sign-up/README.md)
  - [/forgot-password](./forgot-password/README.md)
  - [/reset-password](./reset-password/README.md)
  - /callback
    Utility page for oauth providers to redirect to after authenticating the user.
    - Redirects to the [Dashboard](../../dashboard/README.md) page if sign-in was successful.
    - Redirects to the [Sign In](./sign-in/README.md) page if sign-in was unsuccessful.

  - ## OAuth Providers
    Sign in or create an account using an oauth provider.
    Used in both the sign in and sign up pages.
    - Supported social media accounts:
      - Github
      - Google
      - LinkedIn
   
  > TODO IF NEEDED: 2fa