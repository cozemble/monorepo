import type { GqlRequest } from '@cozemble/graphql-core'
import axios from 'axios'

export interface GqlData {
  _type: 'gql.data'
  data: Record<string, unknown>
}

function gqlData(data: Record<string, unknown>): GqlData {
  return {
    _type: 'gql.data',
    data,
  }
}

export interface GqlError {
  _type: 'gql.error'
  errors: Record<string, unknown>[]
}

function gqlError(errors: Record<string, unknown>[]): GqlError {
  return {
    _type: 'gql.error',
    errors,
  }
}

export type GqlRequestOutcome = GqlData | GqlError

export interface GraphQlClient {
  execute(request: GqlRequest): Promise<GqlRequestOutcome>
}

export class AxiosGraphQlClient implements GraphQlClient {
  constructor(private readonly endpoint: string) {}

  async execute(gqlRequest: GqlRequest): Promise<GqlRequestOutcome> {
    const data = { query: gqlRequest.mutation, variables: {} }
    const config = {
      headers: {},
    }
    const response = await axios.post(this.endpoint, data, config)
    if (response.data.errors) {
      return gqlError(response.data.errors)
    }
    return gqlData(response.data.data)
  }
}
