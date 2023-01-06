import {Windower} from "./window";

export function camelcaseToSentenceCase(camelcase: string, uppercaseInitial = true): string {
    let result = camelcase.replace(/([A-Z])/g, " $1")
    if (uppercaseInitial) {
        result = result.charAt(0).toUpperCase() + result.slice(1)
    }
    return result
}

export function camelize(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export function snakeCase(str: string) {
    const splitCaps = (s: string) => s
        .replace(/([a-z])([A-Z]+)/g, (m, s1, s2) => s1 + ' ' + s2)
        .replace(/([A-Z])([A-Z]+)([^a-zA-Z0-9]*)$/, (m, s1, s2, s3) => s1 + s2.toLowerCase() + s3)
        .replace(/([A-Z]+)([A-Z][a-z])/g,
            (m, s1, s2) => s1.toLowerCase() + ' ' + s2);
    return splitCaps(str)
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
}

export function isUndefinedOrNullOrEmptyString(str: string) {
    return str === undefined || str === null || str.toString() === "";
}

function extractTermsRecursive(collector: string[], accumulatingTerm: string, depth: number, currentCharactersWindow: Windower<string>, remainingCharactersWindow: Windower<string>, openingDelimiter: string, closingDelimiter: any): string[] {
    const currentCharacters = currentCharactersWindow.current()
    if (currentCharacters === null) {
        return collector
    }
    const currentString = currentCharacters.join("")
    if (currentString === openingDelimiter) {
        return extractTermsRecursive(collector, accumulatingTerm + currentString, depth + 1, currentCharactersWindow.advance(openingDelimiter.length), remainingCharactersWindow.advance(openingDelimiter.length), openingDelimiter, closingDelimiter)
    }
    if (currentString === closingDelimiter) {
        if (depth === 0) {
            return extractTermsRecursive(collector, accumulatingTerm, depth, currentCharactersWindow.advance(openingDelimiter.length), remainingCharactersWindow.advance(openingDelimiter.length), openingDelimiter, closingDelimiter)
        }
        if (depth === 1) {
            collector.push(accumulatingTerm + currentString)
            return extractTermsRecursive(collector, "", depth - 1, currentCharactersWindow.advance(openingDelimiter.length), remainingCharactersWindow.advance(openingDelimiter.length), openingDelimiter, closingDelimiter)
        } else {
            return extractTermsRecursive(collector, accumulatingTerm + currentCharacters[0], depth - 1, currentCharactersWindow.advance(1), remainingCharactersWindow.advance(1), openingDelimiter, closingDelimiter)
        }
    }
    if (depth === 0) {
        return extractTermsRecursive(collector, accumulatingTerm, depth, currentCharactersWindow.advance(1), remainingCharactersWindow.advance(1), openingDelimiter, closingDelimiter)
    }
    return extractTermsRecursive(collector, accumulatingTerm + currentCharacters[0], depth, currentCharactersWindow.advance(1), remainingCharactersWindow.advance(1), openingDelimiter, closingDelimiter)
}

interface TermCollector {
    term: string
    children: TermCollector[]
}

type Acceptor = (collected: string[], characterWindow: Windower<string>) => { collected: string[], characterWindow: Windower<string>, acceptor: Acceptor }

function closingDelimiterSeeker(closingDelimiter: string, openingDelimited: string): Acceptor {
    return (collected, characterWindow) => {
        let stringBeingBuilt = ""
        let current = characterWindow.current()
        while (current !== null && current.join("") !== closingDelimiter) {
            stringBeingBuilt = stringBeingBuilt + current[0]
            characterWindow = characterWindow.advance(1)
            current = characterWindow.current()
        }
        if (current === null) {
            return {collected, characterWindow, acceptor: terminalAcceptor()}
        }
        stringBeingBuilt = stringBeingBuilt + current[0]
        collected = [stringBeingBuilt, ...collected]
        return {collected, characterWindow, acceptor: openingDelimiterSeeker(openingDelimited, closingDelimiter)}
    }
}

function terminalAcceptor(): Acceptor {
    const terminal = (collected: string[], characterWindow: Windower<string>) => ({
        collected,
        characterWindow,
        acceptor: terminal
    })
    return terminal
}

function openingDelimiterSeeker(openingDelimiter: string, closingDelimiter: string): Acceptor {
    return (collected, characterWindow) => {
        let current = characterWindow.current()
        while (current !== null && current.join("") !== openingDelimiter) {
            characterWindow = characterWindow.advance(1)
            current = characterWindow.current()
        }
        if (current === null) {
            return {collected, characterWindow, acceptor: terminalAcceptor()}
        }
        return {
            collected,
            characterWindow,
            acceptor: closingDelimiterSeeker(closingDelimiter, openingDelimiter)
        }
    }
}

class Collector {
    private depth = 0
    private collected: string[] = []
    private stringBeingBuilt = ""

    push() {
        this.depth = this.depth + 1
        if (this.depth === 1) {
            this.stringBeingBuilt = ""
        }
    }

    pop() {
        if (this.depth === 1) {
            this.collected = [this.stringBeingBuilt, ...this.collected]
            this.stringBeingBuilt = ""
        }
        this.depth = Math.max(0, this.depth - 1)
    }

    add(s: string) {
        if (this.depth > 0) {
            this.stringBeingBuilt = this.stringBeingBuilt + s
        }
    }

    finalCollected() {
        return [...this.collected].reverse()
    }
}

function extractTermsIterative(input: string, openingDelimiter: string, closingDelimiter: string): string[] {
    let characterWindow = new Windower(openingDelimiter.length, input.split(''))
    let current = characterWindow.current()
    let collector = new Collector()
    while (current !== null) {
        const currentString = current.join("")
        if (currentString === openingDelimiter) {
            collector.push()
            collector.add(currentString)
            characterWindow = characterWindow.advance(currentString.length - 1)
        } else if (currentString === closingDelimiter) {
            collector.add(currentString)
            collector.pop()
            characterWindow = characterWindow.advance(currentString.length - 1)
        } else {
            collector.add(current[0])
        }
        characterWindow = characterWindow.advance(1)
        current = characterWindow.current()
    }
    return collector.finalCollected()
}

export function extractTerms(input: string, openingDelimiter: string, closingDelimiter: string): string[] {
    if (openingDelimiter.length !== closingDelimiter.length) {
        throw new Error("Length of opening and closing delimiters must be equal")
    }
    return extractTermsIterative(input, openingDelimiter, closingDelimiter)
    // const characters = input.split('')
    // const initialCharsWindow = new Windower(openingDelimiter.length, characters)
    // const remainingCharsWindow = new Windower(openingDelimiter.length, characters, openingDelimiter.length)
    // return extractTermsRecursive([], "", 0, initialCharsWindow, remainingCharsWindow, openingDelimiter, closingDelimiter)
}

export function paragraphs(lines: string[], beginParaPredicate: (line: string) => Boolean, endParaPredicate: (line: string) => Boolean): string[][] {
    const result: string[][] = []
    let currentPara: string[] | null = null
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (endParaPredicate(line) && currentPara !== null) {
            currentPara.push(line)
            result.push(currentPara)
            currentPara = null
        }
        if (beginParaPredicate(line)) {
            if (currentPara !== null) {
                throw new Error(`nested begin paragraph encountered, line #:${i} '${line}'`)
            } else {
                currentPara = [line]
            }
        } else if (currentPara !== null) {
            currentPara.push(line)
        }
    }
    return result
}

export function splitAtFirst(delim: string, str: string): string[] {
    const index = str.indexOf(delim)
    if (index === -1) {
        return ["", str]
    }
    const lhs = str.substr(0, index)
    const rhs = str.substr(index + delim.length)
    return [lhs, rhs]
}

export function basename(path: string) {
    return path.replace(/.*\//, '');
}

export function dirname(path: string) {
    let match = path.match(/.*\//);
    if (match === null) {
        throw new Error("match is null");
    }
    return match[0];
}

export function mask(header: string | undefined) {
    if (header) {
        return Array.from(header).map((c, index) => index < 4 ? c : "*").join("")
    }
    return null
}
