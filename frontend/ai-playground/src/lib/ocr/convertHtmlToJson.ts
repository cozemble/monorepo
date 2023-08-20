import type { JsonSchema } from '@cozemble/model-core'

export async function convertHtmlToJson(schema: JsonSchema, html: string): Promise<any> {
  const fetched = await fetch('/htmlToJson', {
    method: 'POST',
    body: JSON.stringify({ schema, html }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (fetched.ok) {
    return await fetched.json()
  }
  throw new Error(`Failed to convert text to json: ${fetched.status} ${fetched.statusText}`)
}
