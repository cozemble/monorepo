import { writable } from 'svelte/store'
import { computePosition } from '@floating-ui/dom'
import { tick } from 'svelte'
import type { EventSourcedModel, EventSourcedModelList } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { Writable } from 'svelte/store'

export interface EditModelModalState {
  modelList: Writable<EventSourcedModelList>
  model: EventSourcedModel
  anchorElement: HTMLElement
}

export const editModelModal = writable<EditModelModalState | null>(null)

export const modelUi = {
  edit(
    modelList: Writable<EventSourcedModelList>,
    model: EventSourcedModel,
    anchorElement: HTMLElement,
  ) {
    editModelModal.set({ modelList, model, anchorElement })
  },
  handleSaveOutcome(saveOutcome: JustErrorMessage | null) {
    if (saveOutcome === null) {
      editModelModal.set(null)
    } else {
      alert(saveOutcome.message)
    }
  },
  closeEditModelModal() {
    editModelModal.set(null)
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
    focusFirstInput(modalElement)
  }
}

function focusFirstInput(parent: HTMLDivElement) {
  const firstInput = parent.querySelector(`input.first`)
  if (firstInput && firstInput instanceof HTMLInputElement) {
    firstInput.focus()
  }
}
