import { strings } from '@cozemble/lang-util'

export const handler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: strings.camelize('Hello from Lambda!') }),
  }
}
