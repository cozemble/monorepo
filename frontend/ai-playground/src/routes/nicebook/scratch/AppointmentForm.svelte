<script lang="ts">

    import type {AppointmentDetails} from "../api/appointment/appoinmentDetails";
    import {callAppointmentApi} from "./callAppointmentApi";

    let appointment: any = {
        firstName: 'Mike',
        lastName: 'Hogan',
        email: 'mike@email.com',
        appointmentTypeID: 55711877,
        datetime: '2023-12-09T09:00:00+0000',
        paid: "yes",
        amountPaid:"65.00",
        "notes": "This is a note",
    };
    let returnedAppointment: any | null = null
    let getAppointmentTypeID = 0;

    async function handleSubmit() {
        // Validate the input
        if (!appointment.firstName || !appointment.lastName || !appointment.email || !appointment.appointmentTypeID || !appointment.datetime) {
            console.error('All fields are required');
            return;
        }

        try {
            await callAppointmentApi('/nicebook/api/appointment', 'POST', JSON.stringify(appointment), (data: AppointmentDetails) => {
                returnedAppointment = data;
            });

            console.log('Appointment submitted successfully');
        } catch (error) {
            console.error('Error submitting appointment:', error);
        }
    }

    async function handleAppointmentget() {
        // Validate the input
        if (!getAppointmentTypeID) {
            console.error('Appointment Type ID is required');
            return;
        }

        try {
            await callAppointmentApi('/nicebook/api/appointment/?appointmentId=' + getAppointmentTypeID, 'GET', null, (data: AppointmentDetails) => {
                returnedAppointment = data;
            });

            console.log('Appointment retrieved successfully');
        } catch (error) {
            console.error('Error retrieving appointment:', error);
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="form flex flex-col w-1/3 mt-8">
    <input class="input input-bordered mb-2" type="text" bind:value={appointment.firstName} placeholder="First Name"/>
    <input class="input input-bordered mb-2" type="text" bind:value={appointment.lastName} placeholder="Last Name"/>
    <input class="input input-bordered mb-2" type="email" bind:value={appointment.email} placeholder="Email"/>
    <input class="input input-bordered mb-2" type="number" bind:value={appointment.appointmentTypeID} placeholder="Appointment Type ID"/>
    <input class="input input-bordered mb-2" type="datetime-local" bind:value={appointment.datetime}/>
    <button class="btn btn-primary" type="submit">Book Appointment</button>
</form>

{#if returnedAppointment}
    <p>Appointment booked successfully!</p>
    <p>Appointment ID: {returnedAppointment.id}</p>
    <p>Appointment Type ID: {returnedAppointment.appointmentTypeId}</p>
    <p>Appointment Type Name: {returnedAppointment.appointmentTypeName}</p>
    <p>Appointment Date: {returnedAppointment.datetime}</p>
    <p>Appointment Duration: {returnedAppointment.duration}</p>
    <p>Appointment Price: {returnedAppointment.price}</p>
    <p>Appointment First Name: {returnedAppointment.firstName}</p>
    <p>Appointment Last Name: {returnedAppointment.lastName}</p>
    <p>Appointment Email: {returnedAppointment.email}</p>
{/if}

<form on:submit|preventDefault={handleAppointmentget} class="form flex flex-col w-1/3 mt-8">
    <input class="input input-bordered mb-2" type="number" bind:value={getAppointmentTypeID} placeholder="Appointment Type ID"/>
    <button class="btn btn-primary" type="submit">Get Appointment</button>
</form>