import { Request, Response, Router } from 'express'
import {
  fromUrlFriendly,
  githubAuth,
  GithubUser,
  SignInState,
  signInState,
  toUrlFriendly,
} from './githubAuth'
import { fetchGithubUserDetails } from './githubUserDetails'
import { withAdminPgClient } from '../infra/postgresPool'
import { establishSession, newSessionTokens } from './establishSession'
import { accessTokenKey, refreshTokenKey } from '@cozemble/backend-tenanted-api-types'
import { db } from './db'

const router: Router = Router()

router.get('/login', (req: Request, res: Response) => {
  try {
    const provider = req.query.provider
    const userPool = req.query.userPool
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
    const githubAuthUrl = githubAuth().code.getUri({
      state: toUrlFriendly(signInState(userPool, provider, cozembleRoot)),
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
    const token = await githubAuth().code.getToken(req.originalUrl)
    const signinState = fromUrlFriendly<SignInState>(state as string)
    if (signinState._type !== 'cozauth.signin.state') {
      return res.status(400).send(`State is not of type cozauth.signin.state`)
    }
    if (signinState.provider !== 'github') {
      return res.status(400).send(`State is not for github`)
    }
    const githubUser = await fetchGithubUserDetails(signinState.userPool, token.accessToken)
    return returnTokensAsCookies(res, signinState, githubUser)
  } catch (e) {
    console.error(e)
    return res.status(500).send()
  }
})

router.post('/token', async (req: Request, res: Response) => {
  try {
    const authorizationToken = req.body.token
    if (!authorizationToken) {
      return res.status(400).send(`No token provided`)
    }
    return await withAdminPgClient(async (client) => {
      const user = await db.authTokens.tradeAuthTokenForUser(client, authorizationToken)
      console.log({ user })
      if (!user) {
        return res.status(401).send()
      }
      const [accessToken, refreshToken] = await newSessionTokens(client, user, user.user_pool)
      return res.status(200).json({ accessToken, refreshToken })
    })
  } catch (e) {
    console.error(`When handling auth token`, e)
    return res.status(500).send()
  }
})

async function returnTokensAsCookies(
  res: Response,
  signInState: SignInState,
  githubUser: GithubUser,
) {
  const userPool = signInState.userPool
  return await withAdminPgClient(async (client) => {
    return establishSession(client, userPool, githubUser).then((session) => {
      const [accessToken, refreshToken] = session
      res.status(302)
      res.header('Location', `${signInState.cozembleRoot}/session/establish`)
      if (signInState.cozembleRoot.startsWith('https://app.cozemble.com')) {
        console.log('setting cookies with domain cozemble.com')
        res.cookie(accessTokenKey(userPool), accessToken, { domain: 'app.cozemble.com' })
        res.cookie(refreshTokenKey(userPool), refreshToken, { domain: 'app.cozemble.com' })
      } else {
        console.log('setting cookies without domain')
        res.cookie(accessTokenKey(userPool), accessToken)
        res.cookie(refreshTokenKey(userPool), refreshToken)
      }
      return res.send()
    })
  })
}

export default router
