import express from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

export interface JwtClaim {
  sub: string
}

export async function withAccessToken<T>(
  req: express.Request,
  res: express.Response,
  f: (claim: JwtClaim) => Promise<T>,
): Promise<any> {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    console.log('no auth header')
    return res.status(401).send()
  }
  const accessToken = authHeader.split(' ')[1]
  if (!accessToken) {
    console.log('no access token')
    return res.status(401).send()
  }
  try {
    const verified = await jwt.verify(accessToken, process.env.JWT_SIGNING_SECRET || '')
    if (!verified) {
      console.log('jwt not decoded')
      return res.status(403).send()
    }
    const decoded = jwt.decode(accessToken) as JwtPayload
    if (decoded.iss !== 'https://cozemble.com') {
      return res.status(403).send()
    }
    if (!decoded.sub) {
      return res.status(403).send()
    }
    const token: JwtClaim = {
      sub: sub(decoded),
    }
    return f(token)
  } catch (e) {
    console.error(e)
    return res.status(401).send()
  }
}

function sub(decoded: jwt.JwtPayload): string {
  if (typeof decoded.sub === 'string') {
    return decoded.sub
  }
  throw new Error(`sub is not a string: ${typeof decoded.sub}`)
}
