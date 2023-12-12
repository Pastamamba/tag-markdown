/**
 * Checks if the current selection cursor is within a specific DOM node.
 *
 * @param {Selection} selection - The current text selection.
 * @param {Node} node - The DOM node to check against.
 * @returns {boolean} - True if the cursor is inside the node, false otherwise.
 */
export const isCursorInNode = (selection, node) => {
    if (!selection || !node) return false;

    let currentSelectionNode = selection.anchorNode;

    while (currentSelectionNode !== null) {
        if (currentSelectionNode === node) return true;
        currentSelectionNode = currentSelectionNode.parentNode;
    }

    return false;
};

/**
 * Gets the text range at a specific point in the document.
 *
 * @param {number} clientX - The horizontal position within the client area.
 * @param {number} clientY - The vertical position within the client area.
 * @returns {Range | null} - The text range at the specified position or null.
 */
export const getCaretRange = (clientX, clientY) => {
    let range = null;

    // Check for browser-specific implementations of getting the caret range
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(clientX, clientY);
    } else if (document.caretPositionFromPoint) {
        const caretPosition = document.caretPositionFromPoint(clientX, clientY);
        if (caretPosition) {
            range = document.createRange();
            range.setStart(caretPosition.offsetNode, caretPosition.offset);
            range.collapse(true);
        }
    }

    return range;
};

/**
 * Saves the current cursor position within an HTML element.
 *
 * @param {HTMLElement} element - The element to save the cursor position in.
 * @returns {number | null} - The saved cursor position or null if unsuccessful.
 */
export const saveCursorPosition = (element) => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();

        preSelectionRange.selectNodeContents(element);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);

        return preSelectionRange.toString().length;
    }

    return null;
};

/**
 * Finds the index of the first span element with a specific data-tag-id attribute.
 *
 * @param {NodeListOf<ChildNode>} childNodes - The child nodes of the parent element.
 * @param {string} dataTagIdValue - The value of the data-tag-id attribute to find.
 * @returns {number | null} - The index of the span element or null if not found.
 */
export const findSpanIndexByDataTagId = (childNodes, dataTagIdValue) => {
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.tagName === 'SPAN' && element.dataset.tagId === dataTagIdValue) {
                return i;
            }
        }
    }
    return null;
};

/**
 * Restores the cursor position within an HTML element.
 *
 * @param {HTMLElement} element - The element to restore the cursor position in.
 * @param {number} cursorPosition - The cursor position to restore.
 * @param {HTMLElement} spanElement - The span element used as a reference.
 */
export const restoreCursorPosition = (element, cursorPosition, spanElement) => {
    const range = document.createRange();
    const selection = window.getSelection();

    if (selection && element.childNodes.length > 0) {
        range.setStart(element.childNodes[0], 0);
        range.collapse(true);

        const { childNodes } = element;
        let nodeIndex = 0;
        let charIndex = cursorPosition;
        let foundPosition = false;

        // Iterate through child nodes to find the correct position to restore the cursor
        while (!foundPosition && nodeIndex < childNodes.length) {
            const childNode = childNodes[nodeIndex];
            const length = childNode.textContent ? childNode.textContent.length : 0;

            if (charIndex >= 0 && charIndex <= length && childNode.nodeName === '#text') {
                const dataTagId = spanElement.dataset.tagId;
                let index = null;
                if (dataTagId) {
                    index = findSpanIndexByDataTagId(childNodes, dataTagId);
                }
                if (index !== null && index >= 0) {
                    range.setStart(childNodes[index + 1], 0);
                } else {
                    range.setStart(childNode, charIndex);
                }

                foundPosition = true;
            } else if (charIndex > length) {
                charIndex -= length;
                nodeIndex++;
            } else {
                foundPosition = true;
            }
        }

        if (!foundPosition) range.setStart(childNodes[0], 0);

        selection.removeAllRanges();
        selection.addRange(range);
    }
};
