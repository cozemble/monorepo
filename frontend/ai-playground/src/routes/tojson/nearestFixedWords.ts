import type {BoundingBox, Paragraph} from "./sectionFinder";
import type {LabelledKeywordResponse} from "../genai/sections/labelKeywords/+server";

function getFixedParagraphs(fixedWords: LabelledKeywordResponse[], paragraphs: Paragraph[]) {
    return fixedWords.map(fixedWord => {
        return paragraphs.find(p => p.id === fixedWord.paragraphNumber)
    }).filter(p => p !== undefined) as Paragraph[];
}

function paragraphTop(paragraph: Paragraph) {
    return paragraph.top;
}

function paragraphBottom(paragraph: Paragraph) {
    return paragraph.top + paragraph.height;
}

function paragraphLeft(paragraph: Paragraph) {
    return paragraph.left;
}

function paragraphRight(paragraph: Paragraph) {
    return paragraph.left + paragraph.width;
}

function boundingBoxTop(boundingBox: BoundingBox) {
    return boundingBox.top;
}

function boundingBoxBottom(boundingBox: BoundingBox) {
    return boundingBox.bottom
}

function boundingBoxLeft(boundingBox: BoundingBox) {
    return boundingBox.left
}

function boundingBoxRight(boundingBox: BoundingBox) {
    return boundingBox.right
}

export function nearestTop(boundingBox: BoundingBox, fixedWords: LabelledKeywordResponse[], paragraphs: Paragraph[]): Paragraph | null {
    const fixedParagraphs = getFixedParagraphs(fixedWords, paragraphs)
    const paragraphsAbove = fixedParagraphs.filter(p => paragraphBottom(p) < boundingBoxTop(boundingBox))
    if (paragraphsAbove.length === 0) {
        return null
    }
    return paragraphsAbove.reduce((a, b) => paragraphBottom(a) > paragraphBottom(b) ? a : b)
}

export function nearestBottom(boundingBox: BoundingBox, fixedWords: LabelledKeywordResponse[], paragraphs: Paragraph[]): Paragraph | null {
    const fixedParagraphs = getFixedParagraphs(fixedWords, paragraphs)
    const paragraphsBelow = fixedParagraphs.filter(p => paragraphTop(p) > boundingBoxBottom(boundingBox))
    if (paragraphsBelow.length === 0) {
        return null
    }
    return paragraphsBelow.reduce((a, b) => paragraphTop(a) < paragraphTop(b) ? a : b)
}

export function nearestLeft(boundingBox: BoundingBox, fixedWords: LabelledKeywordResponse[], paragraphs: Paragraph[]): Paragraph | null {
    const fixedParagraphs = getFixedParagraphs(fixedWords, paragraphs)
    const paragraphsLeft = fixedParagraphs.filter(p => paragraphRight(p) < boundingBoxLeft(boundingBox))
    if (paragraphsLeft.length === 0) {
        return null
    }
    return paragraphsLeft.reduce((a, b) => paragraphRight(a) > paragraphRight(b) ? a : b)
}

export function nearestRight(boundingBox: BoundingBox, fixedWords: LabelledKeywordResponse[], paragraphs: Paragraph[]): Paragraph | null {
    const fixedParagraphs = getFixedParagraphs(fixedWords, paragraphs)
    const paragraphsRight = fixedParagraphs.filter(p => paragraphLeft(p) > boundingBoxRight(boundingBox))
    if (paragraphsRight.length === 0) {
        return null
    }
    return paragraphsRight.reduce((a, b) => paragraphLeft(a) < paragraphLeft(b) ? a : b)
}

export type BoundingBoxWords = {
    top: Paragraph | null
    bottom: Paragraph | null
    left: Paragraph | null
    right: Paragraph | null
}

export function getBoundingBoxWords(boundingBox: BoundingBox, fixedWords: LabelledKeywordResponse[], paragraphs: Paragraph[]): BoundingBoxWords {
    return {
        top: nearestTop(boundingBox, fixedWords, paragraphs),
        bottom: nearestBottom(boundingBox, fixedWords, paragraphs),
        left: nearestLeft(boundingBox, fixedWords, paragraphs),
        right: nearestRight(boundingBox, fixedWords, paragraphs)
    }
}

export function getParagraphsInBoundingBox(boundingBox: BoundingBox, paragraphs: Paragraph[]): Paragraph[] {
    return paragraphs.filter(paragraph => {
        const paragraphTop = paragraph.top;
        const paragraphBottom = paragraph.top + paragraph.height;
        const paragraphLeft = paragraph.left;
        const paragraphRight = paragraph.left + paragraph.width;

        const isInVerticalBounds = paragraphTop >= boundingBox.top && paragraphBottom <= boundingBox.bottom;
        const isInHorizontalBounds = paragraphLeft >= boundingBox.left && paragraphRight <= boundingBox.right;

        return isInVerticalBounds && isInHorizontalBounds;
    }).sort((a, b) => {
        if (a.top === b.top) {
            return a.left - b.left;
        }
        return a.top - b.top;
    });
}


