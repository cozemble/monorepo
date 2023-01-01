import type {Model, ModelId} from "@cozemble/model-core";

export interface ModelEditorHost {
    modelChanged(model: Model): void

    modelAdded(model: Model): void

    modelWithId(id: ModelId): Model
}