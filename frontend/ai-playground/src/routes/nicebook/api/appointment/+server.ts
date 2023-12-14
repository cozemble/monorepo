import {mandatory} from '@cozemble/lang-util'
import {error} from '@sveltejs/kit'
import type {AppointmentDetails} from "./appoinmentDetails";
import type {RequestEvent} from "@sveltejs/kit";

export async function POST({request}) {
    console.log('POST')
    const username = mandatory(process.env.ACUITY_USERNAME, 'No ACUITY_USERNAME in env')
    const apiKey = mandatory(process.env.ACUITY_API_KEY, 'No ACUITY_API_KEY in env')
    const appointmentDetails: AppointmentDetails = await request.json()

    const url = 'https://acuityscheduling.com/api/v1/appointments?admin=true';
    const headers = new Headers({
        'Authorization': `Basic ${btoa(username + ":" + apiKey)}`,
        'Content-Type': 'application/json'
    });

    try {
        const response = await fetch(url, {headers, method: 'POST', body: JSON.stringify(appointmentDetails)})
        if (!response.ok) {
            console.log({response, body: await response.text()})
            throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        return new Response(JSON.stringify(data), {status: 200})
    } catch (e: any) {
        console.log({e})
        console.error('Failed to create appointment:', e);
        throw error(500, e.message)
    }
}

export async function GET(event: RequestEvent) {
    console.log('GET')
    const username = mandatory(process.env.ACUITY_USERNAME, 'No ACUITY_USERNAME in env')
    const apiKey = mandatory(process.env.ACUITY_API_KEY, 'No ACUITY_API_KEY in env')
    const appointmentId = event.url.searchParams.get('appointmentId')
    if(!appointmentId) {
        throw error(400, 'Invalid query - no appointmentId')
    }

    const url = `https://acuityscheduling.com/api/v1/appointments/${appointmentId}`;
    const headers = new Headers({
        'Authorization': `Basic ${btoa(username + ":" + apiKey)}`
    });

    try {
        const response = await fetch(url, {headers, method: 'GET'})
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        return new Response(JSON.stringify(data), {status: 200})
    } catch (e: any) {
        console.error('Failed to fetch appointment:', e);
        throw error(500, e.message)
    }
}
