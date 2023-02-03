<script lang="ts">
import type { RecordEditContext } from './RecordEditContext'
import EditRecord from './EditRecord.svelte'

export let recordEditContext: RecordEditContext
let stack: RecordEditContext[] = [recordEditContext]

function pushContext(context: RecordEditContext) {
  const current = stack[0]
  context.prefixTitle(current.title + ' > ')

  stack = [context, ...stack]
}

function popContext() {
  const [_head, ...tail] = stack
  stack = tail
}
</script>

{#key stack[0].id}
  <EditRecord recordEditContext={stack[0]} {pushContext} {popContext} />
{/key}
