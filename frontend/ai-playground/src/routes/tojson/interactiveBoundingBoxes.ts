import interact from 'interactjs';
import type {BoundingBox} from "./sectionFinder";
import type {Writable} from "svelte/store";

export function interactive(node: HTMLElement, params: { index: number, htmlContainer: HTMLDivElement, boundingBoxes: Writable<BoundingBox[]> }) {
    interact(node)
        .draggable({
            // Draggable options
            onmove: event => {
                params.boundingBoxes.update(bboxes => {
                    const containerWidth = params.htmlContainer.clientWidth;
                    const containerHeight = params.htmlContainer.clientHeight;
                    const bbox = bboxes[params.index];
                    // Update bbox top and left based on drag
                    bbox.top += event.dy / containerHeight * 100;
                    bbox.left += event.dx / containerWidth * 100;

                    bboxes[params.index] = bbox;
                    return bboxes;
                });
            }
        })
        .resizable({
            // Resizable options
            edges: {left: true, right: true, bottom: true, top: true},
            onmove: event => {
                const containerWidth = params.htmlContainer.clientWidth;
                const containerHeight = params.htmlContainer.clientHeight;
                params.boundingBoxes.update(bboxes => {
                    const bbox = bboxes[params.index];
                    // Calculate the change in size
                    const dxPercentage = event.dx / containerWidth * 100;
                    const dyPercentage = event.dy / containerHeight * 100;

                    // Update bbox right and bottom
                    if (event.edges.right) bbox.right += dxPercentage;
                    if (event.edges.bottom) bbox.bottom += dyPercentage;
                    if (event.edges.left) bbox.left += dxPercentage;
                    if (event.edges.top) bbox.top += dyPercentage;

                    bboxes[params.index] = bbox;
                    return bboxes;
                })
            }
        });
    return {
        // Optional: Cleanup function
        destroy() {
            // destroy interact.js instance, if necessary
        }
    };
}
