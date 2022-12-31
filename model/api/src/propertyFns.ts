import {Property} from "@cozemble/model-core/dist/esm";
import {stringPropertyRegistration} from "@cozemble/model-string-core";

export const propertyFns = {
    newInstance(): Property {
        return stringPropertyRegistration.newProperty()
    }
}
