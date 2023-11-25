export type Paragraph = {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    text: string;
};

export function extractParagraphs(html: string): Paragraph[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const paragraphs = Array.from(doc.querySelectorAll('.text-box')).map(p => {
        const style = p.getAttribute('style') ?? '';
        const topMatch = /top: (\d+(\.\d+)?%);/.exec(style);
        const leftMatch = /left: (\d+(\.\d+)?%);/.exec(style);
        const widthMatch = /width: (\d+(\.\d+)?%);/.exec(style);
        const heightMatch = /height: (\d+(\.\d+)?%);/.exec(style);

        return {
            id: p.id,
            top: topMatch ? parseFloat(topMatch[1]) : 0,
            left: leftMatch ? parseFloat(leftMatch[1]) : 0,
            width: widthMatch ? parseFloat(widthMatch[1]) : 0,
            height: heightMatch ? parseFloat(heightMatch[1]) : 0,
            text: p.textContent?.trim() ?? '',
        };
    });

    return paragraphs;
}

export function groupBySections(paragraphs: Paragraph[]): Paragraph[][] {
    // First, sort by 'left' to group elements into columns
    paragraphs.sort((a, b) => a.left - b.left);

    // Horizontal clustering: group into columns
    const horizontalThreshold = 10; // Horizontal threshold for columns
    let currentColumn: Paragraph[] = [];
    const columns: Paragraph[][] = [];

    paragraphs.forEach(p => {
        if (currentColumn.length === 0) {
            currentColumn.push(p);
        } else {
            const lastParagraphInColumn = currentColumn[currentColumn.length - 1];
            if (Math.abs(p.left - lastParagraphInColumn.left) < horizontalThreshold) {
                currentColumn.push(p);
            } else {
                columns.push(currentColumn);
                currentColumn = [p];
            }
        }
    });
    if (currentColumn.length > 0) {
        columns.push(currentColumn);
    }

    // Now, within each column, sort by 'top' and group into sections
    const verticalThreshold = 5; // Vertical threshold for sections within columns
    const sections: Paragraph[][] = [];

    columns.forEach(column => {
        column.sort((a, b) => a.top - b.top);
        let currentSection: Paragraph[] = [];
        column.forEach(p => {
            if (currentSection.length === 0) {
                currentSection.push(p);
            } else {
                const lastParagraphInSection = currentSection[currentSection.length - 1];
                if (Math.abs(p.top - lastParagraphInSection.top) < verticalThreshold) {
                    currentSection.push(p);
                } else {
                    sections.push(currentSection);
                    currentSection = [p];
                }
            }
        });
        if (currentSection.length > 0) {
            sections.push(currentSection);
        }
    });

    return sections;
}

export type BoundingBox = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export function getBoundingBox(group: Paragraph[]): BoundingBox {
    // Initialize bounding box values
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = 0;
    let maxY = 0;

    // Calculate the bounding box
    group.forEach((p) => {
        minX = Math.min(minX, p.left);
        minY = Math.min(minY, p.top);
        maxX = Math.max(maxX, p.left + p.width);
        maxY = Math.max(maxY, p.top + p.height);
    });

    // Return the bounding box coordinates
    return {
        top: minY,
        left: minX,
        right: maxX,
        bottom: maxY
    };
}


