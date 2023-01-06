import type {Model, ModelEvent, ModelId} from "@cozemble/model-core";
import {eventSourcedModelFns, type EventSourcedModel} from "@cozemble/model-event-sourced";
import type {ModelEditorHost} from "$lib/ModelEditorHost";
import {mandatory} from "@cozemble/lang-util";
import {modelIdFns} from "@cozemble/model-api";
import {type Writable, writable} from "svelte/store";
import {modelNameFns} from "@cozemble/model-core";

export const allModels: Writable<EventSourcedModel[]> = writable([])

export const host: ModelEditorHost = {
    modelChanged(id: ModelId, event: ModelEvent) {
        allModels.update(models => {
            return models.map(model => {
                if (modelIdFns.equals(model.model.id, id)) {
                    return eventSourcedModelFns.addEvent(model, event)
                } else {
                    return model
                }
            })
        })
    },

    modelAdded(model: Model) {
        allModels.update(models => [...models, eventSourcedModelFns.newInstance(model)])
    },

    modelWithId(allModels: EventSourcedModel[], id: ModelId): EventSourcedModel {
        return mandatory(allModels.find(m => modelIdFns.equals(m.model.id, id)), `No model with id ${id}`)
    }
}

const storageKey = 'com.cozemble.model.editor.route.page'

export function bootstrapHost(localStorage: Storage) {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
        allModels.set(JSON.parse(stored))
    } else {
        allModels.set([eventSourcedModelFns.newInstance(modelNameFns.newInstance("My model"))])
    }
    return allModels.subscribe(models => localStorage.setItem(storageKey, JSON.stringify(models)))
}