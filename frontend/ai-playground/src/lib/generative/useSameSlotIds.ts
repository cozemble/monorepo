import type { Model, ModelSlot } from '@cozemble/model-core'

function copySlotIds(from: ModelSlot[], to: ModelSlot[]): ModelSlot[] {
  return to.map((toSlot) => {
    const maybeFrom = from.find(
      (fromSlot) => fromSlot.name.value === toSlot.name.value,
    ) as ModelSlot
    if (!maybeFrom) {
      return toSlot
    }
    return { ...toSlot, id: maybeFrom.id } as ModelSlot
  })
}

export function useSameSlotIds(from: Model[], to: Model[]): Model[] {
  return to.map((toModel) => {
    const maybeFrom = from.find((fromModel) => fromModel.name.value === toModel.name.value)
    if (!maybeFrom) {
      return toModel
    }
    return { ...toModel, slots: copySlotIds(maybeFrom.slots, toModel.slots) }
  })
}
