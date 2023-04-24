import { writable } from 'svelte/store'
import { computePosition } from '@floating-ui/dom'
import { tick } from 'svelte'
import type { Model } from '@cozemble/model-core'

export interface EditModelModalState {
  model: Model
  anchorElement: HTMLElement
}

export const editModelModal = writable<EditModelModalState | null>(null)

export const modelUi = {
  edit(model: Model, anchorElement: HTMLElement) {
    editModelModal.set({ model, anchorElement })
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
