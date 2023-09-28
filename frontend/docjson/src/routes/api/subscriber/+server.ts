import { json, type RequestEvent } from '@sveltejs/kit'

interface ISubscriber {
  email: string
}

export async function POST({ request }: RequestEvent<Partial<ISubscriber>>) {
  try {
    const SUPA_BASE_INSERT_URL = String(process.env.SUPABASE_SUBSCRIBE_URL)
    const SUPABASE_KEY = String(process.env.SUPABASE_KEY)
    const jsonBody = await request.json()

    const headers: HeadersInit = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
      'Content-Type': 'application/json',
    }

    const subscribeUser = (payload: ISubscriber) =>
      new Promise((resolve, reject) => {
        fetch(SUPA_BASE_INSERT_URL, {
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
