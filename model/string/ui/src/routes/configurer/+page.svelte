<script lang="ts">
import StringPropertyConfigurer from '$lib/StringPropertyConfigurer.svelte'
import { editorHost, emptyFormErrorState } from '@cozemble/model-editor-sdk'
import { writable } from 'svelte/store'
import { stringPropertyFns } from '@cozemble/model-string-core'

let property = stringPropertyFns.newInstance('Property 1')
const formErrorState = writable(emptyFormErrorState())
editorHost.setErrorState(formErrorState)
</script>

<StringPropertyConfigurer {property} />
