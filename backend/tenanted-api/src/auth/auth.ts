import { Request, Response, Router } from 'express'
import { fromUrlFriendly, githubAuth, SignInState, signInState, toUrlFriendly } from './githubAuth.ts'
import { fetchGithubUserDetails } from './githubUserDetails.ts'
import { withAdminPgClient } from '../infra/postgresPool.ts'
import { newSessionTokens } from './establishSession.ts'
import { db } from './db.ts'
import { mandatory } from '@cozemble/lang-util'

const router: Router = Router()

router.get('/login', (req: Request, res: Response) => {
  try {
    const provider = req.query.provider
    const userPool = req.query.userPool
    const env = mandatory(req.env, `No env in request`)
    const cozembleRoot = req.query.cozembleRoot as string
    if (!provider || !userPool) {
      return res.status(400).send('Missing provider or userPool')
    }
    if (!cozembleRoot) {
      return res.status(400).send('Missing cozembleRoot')
    }
    if (
      !(
        cozembleRoot.startsWith('http://localhost:') ||
        cozembleRoot.startsWith('https://app.cozemble.com')
      )
    ) {
      console.log('illegal cozembleRoot', cozembleRoot)
      return res.status(400).send('illegal redirect')
    }
    if (provider !== 'github') {
      return res.status(400).send(`Unsupported provider: ${provider}`)
    }
    if (userPool !== 'root') {
      return res.status(400).send(`Unsupported user pool: ${userPool}`)
    }
    const githubAuthUrl = githubAuth(env).code.getUri({
      state: toUrlFriendly(signInState(env, userPool, provider, cozembleRoot)),
    })
    return res.status(302).header('Location', githubAuthUrl).send()
  } catch (e) {
    console.error(e)
    return res.status(500).send()
  }
})

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const state = req.query.state
    if (!state) {
      return res.status(400).send(`No state provided in callback url`)
    }
    const env = mandatory(req.env, `No env in request`)
    const token = await githubAuth(env).code.getToken(req.originalUrl)
    const signinState = fromUrlFriendly<SignInState>(state as string)
    if (signinState._type !== 'cozauth.signin.state') {
      return res.status(400).send(`State is not of type cozauth.signin.state`)
    }
    if (signinState.provider !== 'github') {
      return res.status(400).send(`State is not for github`)
    }
    const githubUser = await fetchGithubUserDetails(token.accessToken)
    return await withAdminPgClient(async (client) => {
      let foundUser = await db.users.getUserByEmail(
        client,
        env,
        signinState.userPool,
        githubUser.email,
      )
      if (!foundUser) {
        foundUser = await db.users.registerUser(
          client,
          env,
          signinState.userPool,
          githubUser.email,
          '',
        )
      }
      const authorizationToken = await db.authTokens.createAuthToken(
        client,
        env,
        foundUser,
        signinState.userPool,
      )
      res.status(302)
      res.header(
        'Location',
        `${signinState.cozembleRoot}/${env}/session/establish?token=${authorizationToken}`,
      )
      return res.send()
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send()
  }
})

router.post('/token', async (req: Request, res: Response) => {
  try {
    const authorizationToken = req.body.authorizationToken
    const givenRefreshToken = req.body.refreshToken
    if (!authorizationToken && !givenRefreshToken) {
      return res.status(400).send(`No token provided`)
    }
    const env = mandatory(req.env, `No env in request`)
    return await withAdminPgClient(async (client) => {
      const user = authorizationToken
        ? await db.authTokens.tradeAuthTokenForUser(client, env, authorizationToken)
        : await db.refreshTokens.tradeRefreshTokenForUser(client, env, givenRefreshToken)
      if (!user) {
        return res.status(401).send()
      }
      const [accessToken, refreshToken] = await newSessionTokens(client, env, user, user.user_pool)
      return res.status(200).json({ accessToken, refreshToken })
    })
  } catch (e) {
    console.error(`When handling token`, e)
    return res.status(500).send()
  }
})

export default router
