export const createUID = (length = 8) =>
  (Math.random() * Date.now()).toString(36).substring(2, 2 + length)

export enum ROUTES {
  SIGN_IN = '/auth/sign-in',
  SIGN_UP = '/auth/sign-up',
  SIGN_OUT = '/auth/sign-out',
  DASHBOARD = '/dashboard',
  HOME = '/'
}