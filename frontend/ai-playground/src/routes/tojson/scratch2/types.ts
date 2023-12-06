
export interface GptVisionSections {
    [sectionName: string]: GptVisionSection
}

export interface GptVisionSection {
    [fieldName: string]: string
}