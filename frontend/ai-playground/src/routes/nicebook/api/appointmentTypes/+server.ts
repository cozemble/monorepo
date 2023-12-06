import { mandatory } from '@cozemble/lang-util'
import { error } from '@sveltejs/kit'


export async function GET() {
    const username = mandatory(process.env.ACUITY_USERNAME, 'No ACUITY_USERNAME in env')
    const apiKey = mandatory(process.env.ACUITY_API_KEY, 'No ACUITY_API_KEY in env')

    const url = 'https://acuityscheduling.com/api/v1/appointment-types'; // Replace with the correct API endpoint
    const headers = new Headers({
        'Authorization': `Basic ${btoa(username + ":" + apiKey)}` // Corrected Basic Auth header
    });

    try {
        const response = await fetch(url, { headers })
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`)
        }
        const data =  await response.json()
        return new Response(JSON.stringify(data), { status: 200 })
    } catch (e:any) {
        console.error('Failed to fetch appointment types:', e);
        throw error(500, e.message)
    }
}
