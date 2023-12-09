/**
 * Checks if the cursor is within a specific HTML node.
 * @param {Selection | null} selection - The current selection.
 * @param {HTMLElement | null} node - The HTML node to check against the cursor position.
 * @returns {boolean} - Indicates if the cursor is inside the provided HTML node.
 */
export const isCursorInNode = (
    selection: Selection | null,
    node: HTMLElement | null
) => {
  if (!selection || !node) return false;

  let currentSelectionNode = selection.anchorNode;

  while (currentSelectionNode !== null) {
    if (currentSelectionNode === node) return true;
    currentSelectionNode = currentSelectionNode.parentNode;
  }

  return false;
};

/**
 * Gets the caret range from the given coordinates (clientX, clientY).
 * @param {number} clientX - The X-coordinate on the screen.
 * @param {number} clientY - The Y-coordinate on the screen.
 * @returns {Range | null} - The caret range or null if not found/supported.
 */
export const getCaretRange = (
    clientX: number,
    clientY: number
): Range | null => {
  let range: Range | null = null;

  if (document.caretRangeFromPoint) {
    // Webkit
    range = document.caretRangeFromPoint(clientX, clientY);
  } else if (document.caretPositionFromPoint) {
    // Firefox
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
 * @param {HTMLElement} element - The HTML element to save the cursor position in.
 * @returns {number | null} - The cursor position within the element or null if unsuccessful.
 */
export const saveCursorPosition = (element: HTMLElement) => {
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();

    if (preSelectionRange) {
      preSelectionRange.selectNodeContents(element);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);

      return preSelectionRange.toString().length;
    }
  }

  return null;
};

/**
 * Finds the index of the first span element with a specific data-tag-id value.
 * @param {NodeListOf<ChildNode>} childNodes - The list of child nodes to search through.
 * @param {string} dataTagIdValue - The value of the data-tag-id to search for.
 * @returns {number | null} - The index of the found span element, or null if not found.
 */
export const findSpanIndexByDataTagId = (
    childNodes: NodeListOf<ChildNode>,
    dataTagIdValue: string
): number | null => {
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    if (node.nodeType === Node.ELEMENT_NODE) { // Ensure it's an element
      const element = node as HTMLElement; // Typecast to HTMLElement
      if (element.tagName === 'SPAN' && element.dataset.tagId === dataTagIdValue) {
        return i; // Found the span with matching data-tag-id
      }
    }
  }
  return null; // Not found
};

/**
 * Restores the cursor position within an HTML element.
 * @param {HTMLElement} element - The HTML element to restore the cursor position in.
 * @param {number} cursorPosition - The cursor position to restore.
 * @param spanElement
 */
export const restoreCursorPosition = (
    element: HTMLElement,
    cursorPosition: number,
    spanElement: HTMLElement
) => {
  const range = document.createRange();
  const selection = window.getSelection();

  if (selection && element.childNodes.length > 0) {
    range.setStart(element.childNodes[0], 0);
    range.collapse(true);

    const { childNodes } = element;
    let nodeIndex = 0;
    let charIndex = cursorPosition;
    let foundPosition = false;

    while (!foundPosition && nodeIndex < childNodes.length) {
      const childNode = childNodes[nodeIndex];
      const { length } = childNode.textContent || '';
      if (
          charIndex >= 0 &&
          charIndex <= length &&
          childNode.nodeName === '#text'
      ) {
        const dataTagId = spanElement.dataset.tagId;
        let index = null;
        if(dataTagId) {
          index = findSpanIndexByDataTagId(childNodes, dataTagId);
        }
        if (index !== null && index >= 0) {
          // If index is valid, set the start at the span element
          range.setStart(childNodes[index + 1], 0);
        } else {
          // If index is not valid, set the start at the current text node
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
