import {getContext, setContext} from 'svelte';
import {Writable} from 'svelte/store';

const formErrorStateContext = "com.cozemble.formErrorStateContext";

export type FormErrorState = {
    _type: "form.error.state"
    showErrors: boolean
}

export function emptyFormErrorState(): FormErrorState {
    return {
        _type: "form.error.state",
        showErrors: false,
    }
}

export const editorHost = {
    setErrorState: (state: Writable<FormErrorState>) => {
        setContext(formErrorStateContext, state)
    }
}

export const editorClient = {
    getErrorState: (): Writable<FormErrorState> => {
        return getContext(formErrorStateContext)
    }
}