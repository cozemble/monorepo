import type { JsonSchema } from '@cozemble/model-core'

export async function convertTextToJson(
  schema: JsonSchema,
  text: string,
  existingObject: any | null,
): Promise<any> {
  const fetched = await fetch('/speech', {
    method: 'POST',
    body: JSON.stringify({ schema, text, existingObject }),
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
