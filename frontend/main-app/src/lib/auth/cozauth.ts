export interface Session {
  _type: 'cozauth.session'
  user: {
    id: string
    email: string
    firstName: string
  }
}

export const cozauth = {
  getSession: async (): Promise<Session | null> => {
    return null
  },
}
