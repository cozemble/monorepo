// @ts-ignore
import mergician from 'mergician';
import {StringKeyedObject} from "./index";

export interface JustErrorMessage {
    _type: "just.error.message"
    message: string
}

export function justErrorMessage(message: string): JustErrorMessage {
    return {_type: "just.error.message", message}
}

export type ErrorMessage = JustErrorMessage
export type MaybeErrorMessage = JustErrorMessage | null

export class ErrorWithContext {
    public messageForUser: string;
    public context: any;
    public error: any;

    constructor(messageForUser: string, context: any, error: any) {
        this.messageForUser = messageForUser;
        this.context = context;
        this.error = error;
    }
}

export function mergeErrorContext(error: any, context: any) {
    if (error.context) {
        error.context = mergician(error.context, context)
    } else {
        error.context = context;
    }
    return error
}

function isFirebaseError(error: any) {
    return error !== undefined && error.code !== undefined && error.name !== undefined;
}

function isGoogleApiError(error: any) {
    return error !== undefined && error.result && error.result.error && error.result.error.code && error.result.error.message;
}

export function bestGuessAtMessageForUser(errorWithContext: ErrorWithContext) {
    let message = errorWithContext.messageForUser;
    let error = errorWithContext.error;
    if (error && error.message) {
        message = message + ` (${error.message})`;
    }
    if (isFirebaseError(error)) {
        message = message + ` (${error.name}: ${error.code})`;
    }
    if (isGoogleApiError(error)) {
        let googleMessage = error.result.error.message;
        let googleCode = error.result.error.message;
        message = message + ` (${googleCode}: ${googleMessage})`;
    }

    return message
}

export function prependToMessage(error: any, prepend: string): any {
    if (typeof error.message !== "undefined") {
        error.message = prepend + error.message
    }
    return error
}

export function mergeContext(error: any, context: StringKeyedObject) {
    const existingContext = error.context ?? {}
    const newContext = {...existingContext, ...context}
    error.context = newContext
    return error
}

export type ErrorCode = { context: string, code: number }
export type ErrorMessageAndCode = { _type: "error.message.and.code", message: string, code: ErrorCode }
export type ClientError = { _type: "client.error", message: JustErrorMessage | ErrorMessageAndCode }
export type Bug = { _type: "bug", message: JustErrorMessage | ErrorMessageAndCode }
export type TypedError = ClientError | Bug


export function errorCode(context: string, code: number): ErrorCode {
    return {context, code}
}

export function errorMessageAndCode(message: string, code: ErrorCode): ErrorMessageAndCode {
    return {_type: "error.message.and.code", message, code}
}

export function clientError(message: JustErrorMessage | ErrorMessageAndCode): ClientError {
    return {_type: "client.error", message}
}

export function toTypedError(error: any): TypedError | null {
    if (error._type === "client.error") {
        return error as ClientError
    }
    if (error._type === "bug") {
        return error as Bug
    }
    return null
}

export function toClientError(error: any): ClientError | null {
    if (error._type === "client.error") {
        return error as ClientError
    }
    return null
}

export function clientErrorCode(error: ClientError | null): ErrorCode | null {
    if (error === null) {
        return null
    }
    if (error.message._type === "error.message.and.code") {
        return error.message.code
    }
    return null
}

export function toBug(error: any): Bug | null {
    if (error._type === "bug") {
        return error as Bug
    }
    return null
}