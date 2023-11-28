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