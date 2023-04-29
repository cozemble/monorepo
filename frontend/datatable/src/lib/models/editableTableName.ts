import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { EditableValue } from '../editors/editableValue'
import { editableWithConditionalChecks } from '../editors/editableValue'
import { cantBeOneOf, notNull, required } from '../errors'

export function editableTableName(name: string, allModels: EventSourcedModel[]): EditableValue {
  return editableWithConditionalChecks(
    name,
    notNull(),
    required(),
    cantBeOneOf(
      allModels.map((m) => m.model.name.value),
      'Table name already exists',
    ),
  )
}

export function editablePluralTableName(
  pluralName: string,
  allModels: EventSourcedModel[],
): EditableValue {
  return editableWithConditionalChecks(
    pluralName,
    notNull(),
    required(),
    cantBeOneOf(
      allModels.map((m) => m.model.name.value),
      'Table plural name already exists',
    ),
  )
}
