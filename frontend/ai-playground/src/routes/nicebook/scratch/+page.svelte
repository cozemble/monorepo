<script lang="ts">
    import {onMount} from 'svelte';
    import type {AppointmentType} from "../api/appointmentTypes/appointmentType";
    import type {AvailabilityResponse} from "../api/availability/times/AvailabilityResponse";
    import {callAppointmentApi} from "./callAppointmentApi";
    import type {AddOn} from "../api/addOns/addOns";

    let appointmentTypes: AppointmentType[] = [];
    let availableAppointmentTimes: AvailabilityResponse[] = [];
    let addOns: AddOn[] = []; // Add a variable for add-ons

    async function fetchAppointmentTypes() {
        await callAppointmentApi('/nicebook/api/appointmentTypes', 'GET', null, (data: AppointmentType[]) => {
            appointmentTypes = data;
        });
    }
    async function fetchAvailableTimes() {
        await callAppointmentApi('/nicebook/api/availability/times?appointmentTypeId=55711877', 'GET', null, (data: AvailabilityResponse[]) => {
            availableAppointmentTimes = data;
        });
    }

    async function fetchAddOns() {
        await callAppointmentApi('/nicebook/api/addOns', 'GET', null, (data: AddOn[]) => {
            addOns = data;
        });
    }

    onMount(() => {
        fetchAppointmentTypes();
        fetchAvailableTimes();
        fetchAddOns();
    });
</script>

<h4>Appointment Types</h4>
<ul>
    {#each appointmentTypes as appointmentType}
        <li><pre>{JSON.stringify(appointmentType, null, 2)}</pre></li> <!-- Adjust according to the actual properties of an appointment type -->
    {/each}
</ul>
<h4>Available times</h4>
<ul>
    {#each availableAppointmentTimes as availableAppointmentTime}
        <li><pre>{JSON.stringify(availableAppointmentTime, null, 2)}</pre></li> <!-- Adjust according to the actual properties of an available appointment time -->
    {/each}
</ul>
<h4>Add-Ons</h4>
<ul>
    {#each addOns as addOn}
        <li><pre>{JSON.stringify(addOn, null, 2)}</pre></li> <!-- Display each add-on -->
    {/each}
</ul>
