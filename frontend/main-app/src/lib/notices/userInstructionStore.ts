import type { UserInstruction } from '@cozemble/data-editor-sdk'
import { writable } from 'svelte/store'
import { uuids } from '@cozemble/lang-util'

export interface IssuedUserInstruction {
  id: string
  instruction: UserInstruction
  dismissed: boolean
}

export const userInstructionStoreFns = {
  add(userInstruction: UserInstruction): void {
    userInstructionStore.update((instructions) => [
      ...instructions,
      { id: uuids.v4(), instruction: userInstruction, dismissed: false },
    ])
  },
  dismiss(instruction: IssuedUserInstruction) {
    userInstructionStore.update((instructions) =>
      instructions.map((i) => (i.id === instruction.id ? { ...i, dismissed: true } : i)),
    )
  },
}
export const userInstructionStore = writable([] as IssuedUserInstruction[])
