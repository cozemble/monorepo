import {ModelId} from "@cozemble/model-core"

export const modelIdFns = {
    equals(a: ModelId, b: ModelId): boolean {
        return a.id === b.id
    }
}