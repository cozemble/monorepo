export async function callAppointmentApi(url:string, method:string, body:any, jsonHandler: (json: any) => void) {
    const headers = new Headers({
        'Content-type': 'application/json',
    });

    try {
        const response = await fetch(url, { method, body, headers });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        jsonHandler(await response.json());
    } catch (error) {
        console.error('Failed to fetch appointment types:', error);
    }

}