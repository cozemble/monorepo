import type {BoundingBox} from "./scratch/sectionFinder";
import type {Writable} from "svelte/store";

export interface MouseDragHandler {
    onMouseDown(event: MouseEvent): void

    onMouseMove(event: MouseEvent): void

    onMouseUp(event: MouseEvent): void
}

export const NoOpMouseDragHandler: MouseDragHandler = {
    onMouseDown(_event: MouseEvent) {
    },
    onMouseMove(_event: MouseEvent) {
    },
    onMouseUp(_event: MouseEvent) {
    },
}

export class AddBoundingBoxMouseDragHandler implements MouseDragHandler {
    constructor(private readonly boundingBoxPreview: Writable<BoundingBox | null>,
                private readonly htmlContainer: HTMLDivElement,
                private readonly onAddBoundingBoxAbort: () => void,
                private readonly onAddBoundingBoxComplete: (box: BoundingBox) => void,
                private isDragging = false,
                private start = {x: 0, y: 0},
                private end = {x: 0, y: 0}) {
    }

    debug() {
        console.log("AddBoundingBoxMouseDragHandler", {isDragging: this.isDragging, start: this.start, end: this.end})
    }

    onMouseDown(event: MouseEvent): void {
        this.isDragging = true;
        const containerRect = this.htmlContainer.getBoundingClientRect();
        this.start = {
            x: event.clientX - containerRect.left,
            y: event.clientY - containerRect.top
        };
        this.end = { ...this.start };
        this.debug();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.isDragging) return;
        const containerRect = this.htmlContainer.getBoundingClientRect();
        this.end = {
            x: event.clientX - containerRect.left,
            y: event.clientY - containerRect.top
        };
        this.boundingBoxPreview.set(this.calculateBoundingBox());
        this.debug();
    }
    onMouseUp(_event: MouseEvent): void {
        console.log("onMouseUp", {_event})
        this.isDragging = false;
        const newBoundingBox = this.calculateBoundingBox();
        this.onAddBoundingBoxComplete(newBoundingBox)
        this.debug()
    }

    calculateBoundingBox(): BoundingBox {
        const containerRect = this.htmlContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const start = this.start;
        const end = this.end;

        return {
            top: (Math.min(start.y, end.y) / containerHeight) * 100,
            left: (Math.min(start.x, end.x) / containerWidth) * 100,
            bottom: (Math.max(start.y, end.y) / containerHeight) * 100,
            right: (Math.max(start.x, end.x) / containerWidth) * 100,
        };
    }


}