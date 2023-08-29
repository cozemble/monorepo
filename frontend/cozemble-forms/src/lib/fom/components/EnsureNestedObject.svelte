<script lang="ts">
    export let value: any
    export let key: string

    if (value[key] === undefined) {
        value[key] = {}
    }
</script>
<slot></slot>