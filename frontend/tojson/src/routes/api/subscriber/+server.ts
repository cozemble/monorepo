import { json, type RequestEvent } from '@sveltejs/kit'

import { env } from '$env/dynamic/public'

interface ISubscriber {
  email: string
}

export async function POST({ request }: RequestEvent<Partial<ISubscriber>>) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL
  const supabaseKey = env.PUBLIC_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_KEY')
  }

  const SUPABASE_SUBSCRIBE_URL = `${supabaseUrl}/rest/v1/subscribe`

  try {
    const jsonBody = await request.json()

    const headers: HeadersInit = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
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
