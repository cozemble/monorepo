import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { writable } from 'svelte/store'
import { computePosition } from '@floating-ui/dom'
import { tick } from 'svelte'

export interface EditModelModalState {
  model: EventSourcedModel
  anchorElement: HTMLElement
}

export const editModelModal = writable<EditModelModalState | null>(null)

export const modelUi = {
  edit(newModel: EventSourcedModel, anchorElement: HTMLElement) {
    editModelModal.set({ model: newModel, anchorElement })
  },
}

export async function positionModal(modalElement: HTMLDivElement, anchorElement: HTMLElement) {
  if (modalElement && anchorElement) {
    computePosition(anchorElement, modalElement).then(({ x, y }) => {
      x = Math.max(10, x)
      Object.assign(modalElement.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
    await tick()
    focusFirstInput(modalElement, 'edit-model-modal')
  }
}

function focusFirstInput(parent: HTMLDivElement, divId: string) {
  const firstInput = parent.querySelector(`input.first`)
  if (firstInput && firstInput instanceof HTMLInputElement) {
    firstInput.focus()
  }
}
