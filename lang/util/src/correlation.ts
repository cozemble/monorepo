import { v4 as uuid } from 'uuid'

export interface CorrelatedSession {
  _type: 'correlated.session'
  correlationSessionId: string
}

export interface CorrelatedRequest {
  _type: 'correlated.request'
  correlationRequestId: string
  session: CorrelatedSession
}

function maybePrefix(prefix: string, id: string): string {
  return prefix ? prefix + '/' + id : id
}

function newCorrelatedRequest(
  session: CorrelatedSession,
  prefix = '',
  correlationRequestId = uuid(),
): CorrelatedRequest {
  return {
    _type: 'correlated.request',
    session,
    correlationRequestId: maybePrefix(prefix, correlationRequestId),
  }
}

function newCorrelatedSession(prefix = '', correlationSessionId = uuid()): CorrelatedSession {
  return {
    _type: 'correlated.session',
    correlationSessionId: maybePrefix(prefix, correlationSessionId),
  }
}

export const correlation = {
  newCorrelatedSession,
  newCorrelatedRequest,
}
