import {getContext, setContext} from 'svelte';
import {Writable} from 'svelte/store';

const formErrorStateContext = "com.cozemble.formErrorStateContext";

type FormSectionErrorState = { sectionId: string, hasError: boolean }

export type FormErrorState = {
    _type: "form.error.state"
    showErrors: boolean
    sections: FormSectionErrorState[]
}

export function emptyFormErrorState(): FormErrorState {
    return {
        _type: "form.error.state",
        showErrors: false,
        sections: []
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
    },
    removeSectionErrorState: (sectionId: string, state: Writable<FormErrorState>) => {
        state.update((s) => {
            return {
                ...s,
                sections: s.sections.filter((section) => section.sectionId !== sectionId)
            }
        })
    },
    setFormSectionErrorState(sectionId: string, hasError: boolean, state: Writable<FormErrorState>) {
        state.update((s) => {
            const section = s.sections.find(s => s.sectionId === sectionId)
            if (section) {
                section.hasError = hasError
            } else {
                s.sections.push({sectionId, hasError})
            }
            return s
        })
    }
}