# Reset Password Page
  Send an email to user to reset their password or display a form to reset their password.
  
  ## 2 cases:
  - ### User is not logged in:
    - Display forgot password form
      - #### On submit
        - Send password reset email
        - Tell user to check their email

    - Link to sign-in page 
    - Link to sign up page

  - ### User is logged in:
    - Display reset password form
      - #### On submit
        - Reset password
        - Redirect to [Dashboard](../../dashboard/README.md) page


