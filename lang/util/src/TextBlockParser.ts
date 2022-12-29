export type LinePredicate = (line: string) => Boolean

const Never: LinePredicate = (s) => false

export class TextBlockParser {
    constructor(private readonly beginBlockPredicate: LinePredicate,
                private readonly endBlockPredicate: LinePredicate,
                private readonly beginNest: LinePredicate = Never,
                private readonly endNest: LinePredicate = Never) {
    }

    parse(lines: string[]): string[][] {
        const result: string[][] = []
        let currentPara: string[] | null = null
        let currentNestLevel = 0
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if(currentPara !== null) {
                currentPara.push(line)
                if(this.beginNest(line)) {
                    currentNestLevel++
                }
                if(this.endBlockPredicate(line) && currentNestLevel === 0) {
                    result.push(currentPara)
                    currentPara = null
                }
                if(this.endNest(line) && currentNestLevel > 0) {
                    currentNestLevel--
                }
            } else if (this.beginBlockPredicate(line)){
                currentPara = [line]
            }
        }
        return result
    }
}