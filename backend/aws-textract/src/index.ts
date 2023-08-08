import { strings } from '@cozemble/lang-util'

export async function handler(event: string) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: strings.camelize('hello world'),
      input: event,
    }),
  }
}
