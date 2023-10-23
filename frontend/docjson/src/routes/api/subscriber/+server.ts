import { json, type RequestEvent } from '@sveltejs/kit'

import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'

interface ISubscriber {
  email: string
}

export async function POST({ request }: RequestEvent<Partial<ISubscriber>>) {
  const SUPABASE_SUBSCRIBE_URL = `${PUBLIC_SUPABASE_URL}/rest/v1/subscribe`

  try {
    const jsonBody = await request.json()

    const headers: HeadersInit = {
      apikey: PUBLIC_SUPABASE_KEY,
      Authorization: `Bearer ${PUBLIC_SUPABASE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
      'Content-Type': 'application/json',
    }

    const subscribeUser = (payload: ISubscriber) =>
      new Promise((resolve, reject) => {
        fetch(SUPABASE_SUBSCRIBE_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers,
        })
          .then(resolve)
          .catch(reject)
      })

    const response = (await subscribeUser(jsonBody)) as Response
    if (!response.ok) {
      const err = await response.text()
      return json(err, { status: 500 })
    }

    return json(response.body, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return json(err.message, { status: 500 })
  }
}
