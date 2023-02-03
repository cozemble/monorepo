<script lang="ts">
    import {allModels} from "../models/host";
    import {sqlMigrations} from "./sqlMigrations";
    import {theSchema} from "./sqlMigrations";
    import {schema} from "@cozemble/sql-actions";

    $: actualModels = $allModels.map(m => m.model)

    function schemaNameChanged(event: Event) {
        const newName = (event.target as HTMLInputElement).value
        theSchema.set(schema(newName))
    }

    function applyToDatabase() {
        alert("Coming soon!")
    }
</script>
{#if actualModels.length === 0}
    <p>When you start creating a model, you will see SQL getting generated here, and you will be able to apply it to a
        database</p>
{:else}
    <br/>
    <p>Here is SQL that builds tables to match your model in Postgres dialect.</p>
    <br/>
    <label for="schema">Destination schema name:</label><br/>
    <input id="schema" type="text" value={$theSchema.name} on:blur={schemaNameChanged}/>
    <pre>{#each $sqlMigrations as migration}{migration} <br/>{/each}</pre>
    <button type="button" on:click={applyToDatabase}>Apply to an actual Postgres database</button>
{/if}
