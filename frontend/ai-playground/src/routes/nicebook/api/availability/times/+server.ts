import {type RequestEvent} from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import {mandatory} from "@cozemble/lang-util";


export async function GET(event: RequestEvent) {
    const appointmentTypeId = event.url.searchParams.get('appointmentTypeId');
    if(!appointmentTypeId) {
        throw error(400, 'Invalid query')
    }

    const userId = mandatory(process.env.ACUITY_USERNAME, 'No ACUITY_USERNAME in env');
    const apiKey = mandatory(process.env.ACUITY_API_KEY, 'No ACUITY_API_KEY in env');

    const url = `https://acuityscheduling.com/api/v1/availability/times?appointmentTypeID=${appointmentTypeId}&date=2023-12-07`;
    const headers = new Headers({
        'Authorization': `Basic ${Buffer.from(userId + ':' + apiKey).toString('base64')}`
    });

    try {
        const response = await fetch(url, {headers});
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const availability = await response.json();
        return new Response(JSON.stringify(availability), { status: 200 })
    } catch (e: any) {
        console.error('Failed to fetch availability:', e);
        throw error(500, e.message)
    }
}
