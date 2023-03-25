import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

async function hasTenantAccess(token: string, tenantId: string): Promise<boolean> {
  const secret = process.env.JWT_SIGNING_SECRET || ''

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload

    // Check if the tenantId exists in the allowedTenants array
    return decoded.tenants.includes(tenantId)
  } catch (err) {
    console.error('Error verifying JWT:', err)
    return false
  }
}

export async function canAccessTenant(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized')
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' from the header value
  const tenantId = req.params.tenantId

  const hasAccess = await hasTenantAccess(token, tenantId)
  if (!hasAccess) {
    return res.status(403).send()
  }

  next()
}
